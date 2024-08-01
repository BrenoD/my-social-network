import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Corrigido para 'jwt-decode'
import './Profile.css';
import Navegation from 'components/Navigation';
import Header from 'components/Header';

interface DecodedToken {
    username: string;
    exp: number;
    iat: number;
    user_id: number;
}

interface Post {
    id: number;
    username: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

const Profile: React.FC = () => {
    const [backgroundImage, setBackgroundImage] = useState<string>('');
    const [profileImage, setProfileImage] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [posts, setPosts] = useState<Post[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            const decodedToken = jwtDecode<DecodedToken>(token);
            const currentUsername = decodedToken.username;
            setUsername(currentUsername);

            // Buscar as postagens do usuário logado usando o username
            const fetchPosts = async () => {
                try {
                    const response = await axios.get<Post[]>(`http://localhost:8000/api/posts?username=${currentUsername}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        }
                    });
                    setPosts(response.data);
                } catch (error) {
                    console.error("Erro ao buscar postagens do usuário:", error);
                    setError('Erro ao buscar postagens.');
                }
            };

            // Buscar a imagem de perfil e fundo do usuário
            const fetchImages = async () => {
                try {
                    const profileImageResponse = await axios.get(`http://localhost:8000/api/users/${decodedToken.user_id}/profile-image`, {
                        responseType: 'blob',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        }
                    });
                    const profileImageURL = URL.createObjectURL(profileImageResponse.data);
                    setProfileImage(profileImageURL);

                    const backgroundImageResponse = await axios.get(`http://localhost:8000/api/users/${decodedToken.user_id}/background-image`, {
                        responseType: 'blob',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        }
                    });
                    const backgroundImageURL = URL.createObjectURL(backgroundImageResponse.data);
                    setBackgroundImage(backgroundImageURL);
                } catch (error) {
                    console.error("Erro ao buscar imagens:", error);
                }
            };

            fetchPosts();
            fetchImages();
        }
    }, []);

    const handleImageUpload = async (file: File, imageType: 'profile' | 'background') => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post(`http://localhost:8000/upload/${imageType}`, formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            // Atualizar a URL da imagem após o upload
            if (imageType === 'profile') {
                const profileImageURL = URL.createObjectURL(file);
                setProfileImage(profileImageURL);
            } else {
                const backgroundImageURL = URL.createObjectURL(file);
                setBackgroundImage(backgroundImageURL);
            }
        } catch (error) {
            console.error(`Erro ao enviar a imagem de ${imageType}:`, error);
        }
    };

    const handleBackgroundImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleImageUpload(file, 'background');
        }
    };

    const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleImageUpload(file, 'profile');
        }
    };

    return (
        <div className='total-area-profile'>
            <Header />
            <div className='area-nav-and-profilecontent'>
                <Navegation />
                <div className="content-post-profile">
                    <div className='profile-area'>
                        <div
                            className='img-background'
                            style={{ backgroundImage: `url(${backgroundImage})` }}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleBackgroundImageChange}
                                style={{ display: 'none' }}
                                id="upload-background"
                            />
                            <label htmlFor="upload-background" className="upload-button">
                                Upload Background
                            </label>
                        </div>
                        <div className='img-profilecontent'>
                            <div className='img-profile'>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfileImageChange}
                                    style={{ display: 'none' }}
                                    id="upload-profile"
                                />
                                <label htmlFor="upload-profile" className="upload-button">
                                    Upload Profile Image
                                </label>
                            </div>
                            <div className='info-profile'>
                                <h2>{username}</h2>
                            </div>
                        </div>
                    </div>
                    <div className='content-feed-profile'>
                        {error && <p className="error-message">{error}</p>}
                        {posts.length > 0 ? (
                            posts.map(post => (
                                post.username === username ? ( // Verifica se o username da postagem é igual ao username do usuário logado
                                    <div key={post.id} className="post">
                                        <div className="postageUser">
                                            <p><strong>{post.username}</strong></p>
                                            <p><strong>Hora:</strong> {new Date(post.createdAt).toLocaleString()}</p>
                                        </div>
                                        <p><strong>Conteúdo:</strong> {post.content}</p>
                                    </div>
                                ) : null
                            ))
                        ) : (
                            <p>Nenhuma postagem encontrada.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
