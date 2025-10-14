import React, { useState } from 'react';
import './ProfilePage.scss';
import { useNavigate } from 'react-router';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();

    // example user (replace with real data or fetch from context)
    const user = {
        name: 'Juan Pérez',
        email: 'juanperez@example.com',
        age: 28,
        favoriteGenres: ['Acción', 'Comedia', 'Drama'],
    };

    // modal states
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    // edit form state
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [age, setAge] = useState(String(user.age));

    const handleSave = () => {
        // Aquí iría la llamada al backend para guardar cambios
        console.log('Guardando perfil', { name, email, age });
        setEditOpen(false);
    };

    const handleConfirmDelete = () => {
        // Aquí iría la lógica para eliminar la cuenta (llamada al backend)
        console.log('Eliminar cuenta para', user.email);
        // limpiar token y redirigir al home
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
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
                <button className="edit-button" onClick={() => setEditOpen(true)}>
                    Edita tu perfil
                </button>
                <button className="delete-button" onClick={() => setDeleteOpen(true)}>
                    Elimina tu perfil
                </button>
            </div>

            {/* Edit Modal */}
            {editOpen && (
                <div className="modal-overlay">
                    <div className="modal-card edit-modal">
                        <button className="modal-close" onClick={() => setEditOpen(false)}>x</button>
                        <h3>Editar Usuario</h3>
                        <p className="modal-sub">Deja en blanco para mantener tu contraseña actual</p>
                        <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" />
                        <input className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                        <input className="form-input" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Edad" />
                        <input className="form-input" type="password" placeholder="Ingresa tu nueva Contraseña" />
                        <input className="form-input" type="password" placeholder="Confirma tu nueva Contraseña" />
                        <div className="modal-actions">
                            <button className="save-button" onClick={handleSave}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteOpen && (
                <div className="modal-overlay">
                    <div className="modal-card delete-modal">
                        <button className="modal-close" onClick={() => setDeleteOpen(false)}>x</button>
                        <h3>Eliminar Usuario</h3>
                        <p>Esta acción eliminará permanentemente tu cuenta</p>
                        <div className="modal-actions">
                            <button className="confirm-delete" onClick={handleConfirmDelete}>Eliminar</button>
                            <button className="cancel-delete" onClick={() => setDeleteOpen(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
