import React from 'react';
import './ProfilePage.scss';
import { useNavigate } from 'react-router';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();

    const user = {
        name: 'Juan Pérez',
        email: 'juanperez@example.com',
        age: 28,
        favoriteGenres: ['Acción', 'Comedia', 'Drama'],
    };

    const handleEditProfile = () => {
        navigate('/editar-perfil');
    };

    const handleDeleteProfile = () => {
        // Aquí podrías agregar lógica de confirmación o navegación
        navigate('/eliminar-perfil');
    };

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-avatar">
                    <span className="avatar-icon">👤</span>
                </div>
                <h2 className="profile-name">{user.name}</h2>
            </div>

            <div className="profile-details">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Edad:</strong> {user.age}</p>
            </div>

            <div className="profile-actions">
                <button className="edit-button" onClick={handleEditProfile}>
                    Edita tu perfil
                </button>
                <button className="delete-button" onClick={handleDeleteProfile}>
                    Elimina tu perfil
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;
