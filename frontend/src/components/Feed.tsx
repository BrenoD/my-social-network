import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Correção no import
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import "./Feed.css";

interface Post {
  id: number;
  username: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface DecodedToken {
  user_id: number; // Altere conforme o campo correto no seu token
  username: string; // Adiciona o campo username ao DecodedToken
  exp: number;
  iat: number;
}

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostText, setNewPostText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Usuário não autenticado.');
        return;
      }
      
      // Decodifica o token JWT para obter o username do usuário
      try {
        const decodedToken = jwtDecode<DecodedToken>(token); // Usa o tipo definido
        const username = decodedToken.username; // Certifique-se de que 'username' é o campo correto no seu token
        setCurrentUser(username);
        console.log("Usuário logado:", username); // Verifique o username do usuário logado
        
        // Buscar as postagens de todos os usuários
        const response = await axios.get<Post[]>("http://localhost:8000/api/posts", {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        console.log('Resposta da API:', response.data); // Verifique o formato da resposta
        setPosts(response.data || []); // Garante que posts nunca seja null

        // Adiciona o console.log para imprimir os usernames das postagens
        response.data.forEach(post => {
          console.log(`Postagem de: ${post.username}`);
        });
      } catch (error) {
        console.error("Erro ao decodificar o token ou buscar postagens:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
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
          if (axios.isAxiosError(error) && error.response?.status === 401) {
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
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setError('Token inválido ou expirado.');
      } else {
        setError('Erro ao criar postagem.');
      }
    }
  };

  const handleDeletePost = async (postId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Usuário não autenticado.');
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      // Atualiza a lista de postagens após a exclusão
      setPosts(posts.filter(post => post.id !== postId));
      setError(null);
    } catch (error) {
      console.error("Erro ao excluir postagem:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setError('Token inválido ou expirado.');
      } else {
        setError('Erro ao excluir postagem.');
      }
    }
  };

  return (
    <div className="totalFeed">
      <div className="feedPost">
        <h2 className="h2-postage">
          <FontAwesomeIcon icon={faPlus} className="icon" /> Feed
        </h2>
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
          posts.slice().reverse().map((post) => (
            <div key={post.id} className="post">
              <div className="postageUser">
                <p><strong>{post.username}</strong></p>
                <p><strong>Hora:</strong> {new Date(post.createdAt).toLocaleString()}</p>
              </div>
              <p><strong>Conteúdo:</strong> {post.content}</p>
              {post.username === currentUser && ( // Usa o username para mostrar o botão de exclusão
                <button onClick={() => handleDeletePost(post.id)} className="button-delete">
                  <FontAwesomeIcon icon={faTrashCan} />
                </button>
              )}
            </div>
          ))
        ) : (
          <p>Nenhuma postagem disponível.</p>
        )}
      </div>
    </div>
  );
}

export default Feed;
