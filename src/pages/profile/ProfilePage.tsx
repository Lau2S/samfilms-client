import React, { useState } from 'react';
import './ProfilePage.scss';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
const ProfilePage: React.FC = () => {
    const navigate = useNavigate();

    // example user (replace with real data or fetch from context)
    const [user, setUser] = useState<any>(null);

useEffect(() => {
  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return; // si no hay token, no puede obtener el perfil

    try {
      const res = await fetch('https://movie-platform-back.onrender.com/api/v1/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
      } else {
        console.error('Error al obtener perfil:', data);
      }
    } catch (err) {
      console.error('Error de conexión:', err);
    }
  };

  fetchProfile();
}, []);


    // modal states
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    // edit form state
    const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [age, setAge] = useState('');

useEffect(() => {
  if (user) {
    setName(user.user_metadata?.nombres || '');
    setEmail(user.email || '');
    setAge(user.user_metadata?.edad || '');
  }
}, [user]);

    const handleSave = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  const body = {
    nombres: name,
    edad: age,
    email,
  };

  try {
    const res = await fetch('https://movie-platform-back.onrender.com/api/v1/users/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (res.ok) {
      alert('Perfil actualizado correctamente');
      setUser(data.data);
      setEditOpen(false);
    } else {
      alert(data.message_es || 'Error al actualizar perfil');
    }
  } catch (err) {
    console.error('Error al actualizar perfil:', err);
  }
};


    const handleConfirmDelete = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  const confirmText = prompt('Escribe "ELIMINAR" para confirmar:');
  if (confirmText !== 'ELIMINAR') {
    alert('Debes escribir ELIMINAR para confirmar');
    return;
  }

  try {
    const res = await fetch('https://movie-platform-back.onrender.com/api/v1/users/me', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password: '', confirmText }),
    });

    if (res.status === 204) {
      alert('Cuenta eliminada correctamente');
      localStorage.clear();
      navigate('/');
    } else {
      const data = await res.json();
      alert(data.message_es || 'Error al eliminar cuenta');
    }
  } catch (err) {
    console.error('Error al eliminar cuenta:', err);
  }
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
