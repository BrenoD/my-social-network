package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gorilla/mux"
)

// Estrutura de Postagem
type Post struct {
	ID        int       `json:"id"`
	Username  string    `json:"username"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"createdAt"`
}

// Estrutura para o token JWT
type Claims struct {
	Username string `json:"username"`
	jwt.StandardClaims
}

// Função para obter o nome do usuário do token JWT
func getUsernameFromToken(r *http.Request) (string, error) {
	tokenString := r.Header.Get("Authorization")
	if tokenString == "" {
		return "", fmt.Errorf("token não fornecido")
	}

	tokenString = strings.TrimPrefix(tokenString, "Bearer ")

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte("suaChaveSecreta"), nil // Substitua com a sua chave secreta
	})

	if err != nil {
		return "", err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims.Username, nil
	}

	return "", fmt.Errorf("token inválido")
}

// Manipulador para criar postagens
func createPostHandler(w http.ResponseWriter, r *http.Request) {
	var newPost Post
	err := json.NewDecoder(r.Body).Decode(&newPost)
	if err != nil {
		http.Error(w, "Erro ao decodificar JSON", http.StatusBadRequest)
		return
	}

	// Obter o nome de usuário do token
	username, err := getUsernameFromToken(r)
	if err != nil {
		http.Error(w, "Não autorizado", http.StatusUnauthorized)
		return
	}

	// Insere o novo post no banco de dados
	sqlStatement := `
		INSERT INTO posts (username, content)
		VALUES ($1, $2)
		RETURNING id, created_at`
	var post Post
	err = db.QueryRow(sqlStatement, username, newPost.Content).Scan(&post.ID, &post.CreatedAt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Responder com status HTTP 201 Created e a postagem criada
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(post)
}

// Manipulador para obter todas as postagens
func getAllPostsHandler(w http.ResponseWriter, r *http.Request) {
	// Obter o nome de usuário do token
	username, err := getUsernameFromToken(r)
	if err != nil {
		http.Error(w, "Não autorizado", http.StatusUnauthorized)
		return
	}

	// Consulta postagens associadas ao usuário autenticado
	rows, err := db.Query("SELECT username, content, created_at FROM posts WHERE username = $1", username)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var posts []Post
	for rows.Next() {
		var post Post
		err := rows.Scan(&post.Username, &post.Content, &post.CreatedAt)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		posts = append(posts, post)
	}

	// Responder com status HTTP 200 OK e a lista de postagens
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}
