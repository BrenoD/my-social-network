package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"golang.org/x/crypto/bcrypt"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	"github.com/rs/cors"
)

// Estrutura de Usuário
type User struct {
	ID        int    `json:"id"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	CreatedAt string `json:"created_at"`
}

// Configurações do banco de dados
const (
	host     = "localhost"
	port     = 5432
	user     = "postgres"
	password = "brenodias10"
	dbname   = "SocialNetwork"
)

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

	// Hash da senha
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Erro ao criar a senha", http.StatusInternalServerError)
		return
	}
	user.Password = string(hashedPassword)

	// Verifica se o email já existe
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

	// Insere o novo usuário
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

// Manipulador para autenticar usuários
func authenticateUser(w http.ResponseWriter, r *http.Request) {
	var user User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var storedPassword string
	err = db.QueryRow("SELECT password FROM users WHERE email = $1", user.Email).Scan(&storedPassword)
	if err != nil {
		http.Error(w, "Email ou senha incorretos", http.StatusUnauthorized)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(user.Password))
	if err != nil {
		http.Error(w, "Email ou senha incorretos", http.StatusUnauthorized)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Login realizado com sucesso!"))
}

// Manipulador para obter usuários
func getUsers(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, username, email, created_at FROM users")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	users := []User{}
	for rows.Next() {
		var user User
		err := rows.Scan(&user.ID, &user.Username, &user.Email, &user.CreatedAt)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		users = append(users, user)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

// Função para configurar e iniciar o servidor
func routes() {
	r := mux.NewRouter()
	r.HandleFunc("/users", createUser).Methods("POST")
	r.HandleFunc("/users", getUsers).Methods("GET")
	r.HandleFunc("/login", authenticateUser).Methods("POST")
	r.HandleFunc("/api/posts", createPostHandler).Methods("POST")
	r.HandleFunc("/api/posts", getAllPostsHandler).Methods("GET")

	c := cors.New(cors.Options{
        AllowedOrigins:   []string{"http://localhost:3000"},
        AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
        AllowedHeaders:   []string{"Authorization", "Content-Type"},
        AllowCredentials: true,
    })

    handler := c.Handler(r)

    srv := &http.Server{
        Handler:      handler,
        Addr:         "0.0.0.0:8000",
        WriteTimeout: 10 * time.Second,
        ReadTimeout:  10 * time.Second,
    }

	fmt.Println("Servidor iniciado na porta 8000")
	log.Fatal(srv.ListenAndServe())
}

// Função principal que configura e inicia o servidor
func main() {
	initDB() // Inicializa a conexão com o banco de dados
	routes() // Configura e inicia o servidor
}
