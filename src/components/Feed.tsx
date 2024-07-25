import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Feed.css";

interface Post {
  id: number;
  username: string;
  content: string;
  createdAt: string;
}

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostText, setNewPostText] = useState("");
  const [username, setUsername] = useState(""); // Armazena o nome do usuário logado
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Usuário não autenticado.');
        return;
      }

      try {
        // Decodifica o token para obter o nome de usuário
        const user = JSON.parse(atob(token.split('.')[1]));
        setUsername(user.username); // Supondo que o nome do usuário esteja no payload do token

        // Busca as postagens
        const response = await axios.get<Post[]>("http://localhost:8000/api/posts", {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        setPosts(response.data);
      } catch (error) {
        console.error("Erro ao buscar postagens:", error);
        if (error.response?.status === 401) {
          setError('Token inválido ou expirado.');
        } else {
          setError('Erro ao buscar postagens.');
        }
      }
    };

    fetchPosts(); // Chama a função ao montar o componente
  }, []);

  const handlePostSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Usuário não autenticado.');
      return;
    }

    try {
      const response = await axios.post<Post>(
        "http://localhost:8000/api/posts",
        {
          username: username, // Envia o nome do usuário logado
          content: newPostText
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log("Postagem criada com sucesso:", response.data);

      // Atualiza a lista de postagens após criar uma nova postagem
      const fetchPosts = async () => {
        try {
          const response = await axios.get<Post[]>("http://localhost:8000/api/posts", {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });
          setPosts(response.data);
        } catch (error) {
          console.error("Erro ao buscar postagens:", error);
          if (error.response?.status === 401) {
            setError('Token inválido ou expirado.');
          } else {
            setError('Erro ao buscar postagens.');
          }
        }
      };

      fetchPosts();
      setNewPostText(""); // Limpa o texto da nova postagem
      setError(null); // Limpa qualquer erro anterior
    } catch (error) {
      console.error("Erro ao criar postagem:", error);
      setError("Erro ao criar postagem.");
    }
  };

  return (
    <div className="totalFeed">
      <div className="feedPost">
        <h2 className="h2-postage">Feed</h2>
        {error && <p className="error-message">{error}</p>}
        <label className="label-postage">Postagem:</label>
        <input id="input-postage"
          type="text"
          className="form-control"
          name="textForFeed"
          value={newPostText}
          onChange={(e) => setNewPostText(e.target.value)}
          placeholder="Compartilhe o que você está pensando!!!"
        />
        <button className="button-postage" onClick={handlePostSubmit}>Enviar</button>
      </div>
      <div className="contentFeed">
        {posts.map((post) => (
          <div key={post.id} className="post">
            <p><strong>Usuário:</strong> {post.username}</p>
            <p><strong>Hora:</strong> {new Date(post.createdAt).toLocaleString()}</p>
            <p><strong>Conteúdo:</strong> {post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;
