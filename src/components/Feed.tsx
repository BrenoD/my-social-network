import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import "./Feed.css";

interface Post {
  id: number;
  username: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostText, setNewPostText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Usuário não autenticado.');
        return;
      }

      try {
        // Busca as postagens de todos os usuários
        const response = await axios.get<Post[]>("http://localhost:8000/api/posts", {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        console.log('Resposta da API:', response.data); // Verifique o formato da resposta
        setPosts(response.data || []); // Garante que posts nunca seja null
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
          content: newPostText // Envia apenas o conteúdo da nova postagem
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
          setPosts(response.data || []); // Garante que posts nunca seja null
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
      if (error.response?.status === 401) {
        setError('Token inválido ou expirado.');
      } else {
        setError('Erro ao criar postagem.');
      }
    }
  };

  return (
    <div className="totalFeed">
      <div className="feedPost">
        <h2 className="h2-postage"><FontAwesomeIcon icon={faPlus} className="icon"/>Feed</h2>
        {error && <p className="error-message">{error}</p>}
        <label className="label-postage">Postagem:</label>
        <input
          id="input-postage"
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
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="post">
              <div className="postageUser">
              <p><strong>{post.username}</strong></p>
              <p><strong>Hora:</strong> {new Date(post.createdAt).toLocaleString()}</p>
              </div>
              <p><strong>Conteúdo:</strong> {post.content}</p>
            </div>
          ))
        ) : (
          <p>Nenhuma postagem disponível.</p>
        )}
      </div>
    </div>
  );
};

export default Feed;
