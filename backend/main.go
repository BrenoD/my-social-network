package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"

	"golang.org/x/crypto/bcrypt"
	"github.com/dgrijalva/jwt-go"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
	_ "github.com/lib/pq"
)

// Estrutura de Usuário
type User struct {
	ID        int    `json:"id"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	CreatedAt string `json:"created_at"`
}

// Estrutura para Claims do JWT
type Claims struct {
	Username string `json:"username"`
	UserID   int    `json:"user_id"`
	jwt.StandardClaims
}

// Configurações do banco de dados
const (
	host     = "localhost"
	port     = 5432
	user     = "postgres"
	password = "brenodias10"
	dbname   = "SocialNetwork"
)

// Configuração do JWT
var jwtKey []byte

type Config struct {
	JWTKey string `json:"jwtKey"`
}

func loadConfig() (*Config, error) {
	file, err := ioutil.ReadFile("config.json")
	if err != nil {
		return nil, err
	}

	var config Config
	if err := json.Unmarshal(file, &config); err != nil {
		return nil, err
	}

	return &config, nil
}

func init() {
	config, err := loadConfig()
	if err != nil {
		log.Fatal("Erro ao carregar configuração: ", err)
	}
	jwtKey = []byte(config.JWTKey)
}

var db *sql.DB

// Inicializa a conexão com o banco de dados
func initDB() {
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	var err error
	db, err = sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatalf("Erro ao abrir o banco de dados: %v", err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatalf("Erro ao conectar ao banco de dados: %v", err)
	}

	fmt.Println("Conexão com o PostgreSQL estabelecida com sucesso!")
}

// Manipulador para criar usuários
func createUser(w http.ResponseWriter, r *http.Request) {
	var user User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Erro ao criar a senha", http.StatusInternalServerError)
		return
	}
	user.Password = string(hashedPassword)

	var existingUserID int
	err = db.QueryRow("SELECT id FROM users WHERE email = $1", user.Email).Scan(&existingUserID)
	if err != nil && err != sql.ErrNoRows {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if existingUserID != 0 {
		http.Error(w, "Email já registrado", http.StatusBadRequest)
		return
	}

	sqlStatement := `
		INSERT INTO users (username, email, password)
		VALUES ($1, $2, $3)
		RETURNING id, created_at`
	err = db.QueryRow(sqlStatement, user.Username, user.Email, user.Password).Scan(&user.ID, &user.CreatedAt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func getUsers(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, username, email, created_at FROM users")
	if err != nil {
		http.Error(w, "Erro ao buscar usuários", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var user User
		if err := rows.Scan(&user.ID, &user.Username, &user.Email, &user.CreatedAt); err != nil {
			http.Error(w, "Erro ao ler dados dos usuários", http.StatusInternalServerError)
			return
		}
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		http.Error(w, "Erro ao iterar sobre os usuários", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

// Manipulador para autenticar usuários
func authenticateUser(w http.ResponseWriter, r *http.Request) {
	var user User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var storedPassword string
	var userID int
	err = db.QueryRow("SELECT id, password, username FROM users WHERE email = $1", user.Email).Scan(&userID, &storedPassword, &user.Username)
	if err != nil {
		http.Error(w, "Email ou senha incorretos", http.StatusUnauthorized)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(user.Password))
	if err != nil {
		http.Error(w, "Email ou senha incorretos", http.StatusUnauthorized)
		return
	}

	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		Username: user.Username,
		UserID:   userID,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		http.Error(w, "Erro ao criar o token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
}


// Manipulador para verificar o token JWT
func verifyToken(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Token não fornecido", http.StatusUnauthorized)
		return
	}

	tokenString := authHeader[len("Bearer "):]

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})

	if err != nil {
		http.Error(w, "Token inválido", http.StatusUnauthorized)
		return
	}

	if !token.Valid {
		http.Error(w, "Token inválido", http.StatusUnauthorized)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// Manipulador para fazer upload de uma imagem
func uploadImageHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	imageType := mux.Vars(r)["imageType"]
	err := r.ParseMultipartForm(10 << 20) // Limite de 10MB
	if err != nil {
		http.Error(w, "Erro ao fazer o parsing do formulário", http.StatusBadRequest)
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Erro ao obter o arquivo", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Gerar um nome único para o arquivo
	fileName := fmt.Sprintf("%d_%s.jpg", time.Now().UnixNano(), imageType)
	filePath := fmt.Sprintf("./public/uploads/%s/%s", imageType, fileName)

	// Cria o diretório se não existir
	err = os.MkdirAll(fmt.Sprintf("./public/uploads/%s", imageType), os.ModePerm)
	if err != nil {
		http.Error(w, "Erro ao criar diretório para o arquivo", http.StatusInternalServerError)
		return
	}

	outFile, err := os.Create(filePath)
	if err != nil {
		http.Error(w, "Erro ao criar o arquivo", http.StatusInternalServerError)
		return
	}
	defer outFile.Close()

	_, err = io.Copy(outFile, file)
	if err != nil {
		http.Error(w, "Erro ao salvar o arquivo", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Arquivo carregado com sucesso"))
}

// Manipulador para obter a imagem do usuário
func getUserImageHandler(w http.ResponseWriter, r *http.Request) {
	imageType := mux.Vars(r)["imageType"]
	userID := mux.Vars(r)["userID"]

	filePath := fmt.Sprintf("./public/uploads/%s/%s_%s.jpg", imageType, userID, imageType)

	http.ServeFile(w, r, filePath)
}

// Função para configurar as rotas e iniciar o servidor
func routes() {
	r := mux.NewRouter()
	r.HandleFunc("/users", createUser).Methods("POST")
	r.HandleFunc("/users", getUsers).Methods("GET")
	r.HandleFunc("/login", authenticateUser).Methods("POST")
	r.HandleFunc("/api/posts", createPostHandler).Methods("POST")
	r.HandleFunc("/api/posts", getAllPostsHandler).Methods("GET")
	r.HandleFunc("/api/posts/{id:[0-9]+}", deletePostHandler).Methods("DELETE")
	r.HandleFunc("/verify-token", verifyToken).Methods("POST")
	r.HandleFunc("/upload/{imageType}", uploadImageHandler).Methods("POST")
	r.HandleFunc("/api/users/{userID}/{imageType}-image", getUserImageHandler).Methods("GET")

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
	})

	handler := c.Handler(r)

	srv := &http.Server{
		Addr:         ":8000",
		Handler:      handler,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	fmt.Println("Servidor iniciado na porta 8000")
	log.Fatal(srv.ListenAndServe())
}

func main() {
	// Inicializa a conexão com o banco de dados
	initDB()

	// Certificar-se de que o diretório de uploads existe
	if _, err := os.Stat("./public/uploads/profile"); os.IsNotExist(err) {
		err := os.MkdirAll("./public/uploads/profile", os.ModePerm)
		if err != nil {
			log.Fatalf("Erro ao criar diretório de uploads: %v", err)
		}
	}
	if _, err := os.Stat("./public/uploads/background"); os.IsNotExist(err) {
		err := os.MkdirAll("./public/uploads/background", os.ModePerm)
		if err != nil {
			log.Fatalf("Erro ao criar diretório de uploads: %v", err)
		}
	}

	routes()
}
