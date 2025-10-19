import React, { useState, useEffect } from 'react';
import './ProfilePage.scss';
import { useNavigate } from 'react-router';
import api from '../../services/api';

interface UserData {
    id: string;
    firstName?: string;
    lastName?: string;
    nombres?: string;
    apellidos?: string;
    email?: string;
    correo?: string;
    age?: number;
    edad?: number;
}

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    // modal states
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    // edit form state
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [age, setAge] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Load user data on mount
    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            // First try to get from localStorage
            const storedUser = localStorage.getItem('user');
            
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                console.log('👤 Usuario desde localStorage:', userData);
                setUser(userData);
                initializeForm(userData);
            } else {
                // If not in localStorage, fetch from API
                console.log('🔄 Obteniendo perfil desde API...');
                const response = await api.getProfile();
                
                if (response.success && response.data) {
                    const apiUser = response.data as UserData;
                    console.log('👤 Usuario desde API:', apiUser);
                    setUser(apiUser);
                    initializeForm(apiUser);
                    // Save to localStorage
                    localStorage.setItem('user', JSON.stringify(apiUser));
                }
            }
        } catch (error) {
            console.error('❌ Error cargando usuario:', error);
            // If there's an error, redirect to login
            navigate('/inicio-sesion');
        } finally {
            setLoading(false);
        }
    };

    const initializeForm = (userData: UserData) => {
        setName(userData.firstName || userData.nombres || '');
        setLastName(userData.lastName || userData.apellidos || '');
        setEmail(userData.email || userData.correo || '');
        setAge(String(userData.age || userData.edad || ''));
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (editOpen || deleteOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }

        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [editOpen, deleteOpen]);

    // Close modal on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setEditOpen(false);
                setDeleteOpen(false);
            }
        };

        if (editOpen || deleteOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [editOpen, deleteOpen]);

    const handleSave = async () => {
        // Validations
        if (newPassword && newPassword !== confirmPassword) {
            alert('❌ Las contraseñas no coinciden');
            return;
        }

        if (newPassword && newPassword.length < 8) {
            alert('❌ La contraseña debe tener al menos 8 caracteres');
            return;
        }

        // Validate and normalize age
        const ageNum = age === '' ? undefined : Number(age);
        if (age !== '' && (isNaN(ageNum as number) || (ageNum as number) < 18 || (ageNum as number) > 120)) {
            alert('❌ Ingresa una edad válida entre 18 y 120');
            return;
        }

        const updateData: any = {
            nombres: name,
            apellidos: lastName,
        } as any;

        if (ageNum !== undefined) updateData.edad = ageNum;
        if (newPassword) updateData.contrasena = newPassword;

        console.log('💾 Guardando cambios (payload):', updateData);

        // Optimistic update: apply changes locally and save previous state for rollback
        const prevUser = user;
        const optimisticUser = (prev => ({
            ...(prev ?? {}),
            firstName: name,
            lastName: lastName,
            nombres: name,
            apellidos: lastName,
            ...(ageNum !== undefined ? { age: ageNum, edad: ageNum } : {}),
        }))(user);

        try {
            // Apply optimistic change
            setUser(optimisticUser as UserData);
            localStorage.setItem('user', JSON.stringify(optimisticUser));

            const response = await api.updateProfile(updateData);

            if (response.success) {
                console.log('✅ Perfil actualizado en servidor:', response.data);

                // If server returns the updated user, prefer it (keeps canonical data)
                if (response.data) {
                    const serverUser = response.data as UserData;
                    setUser(serverUser);
                    localStorage.setItem('user', JSON.stringify(serverUser));
                }

                alert('✅ Perfil actualizado exitosamente');
                setEditOpen(false);

                // Clear password fields
                setNewPassword('');
                setConfirmPassword('');
            } else {
                // Server returned success=false: rollback
                throw new Error(response.message || response.message_es || 'Error al actualizar');
            }
        } catch (error: any) {
            console.error('❌ Error actualizando perfil:', error);
            // Rollback to previous user state
            setUser(prevUser);
            if (prevUser) localStorage.setItem('user', JSON.stringify(prevUser));
            alert('❌ Error al actualizar el perfil: ' + (error.message || 'Error desconocido'));
        }
    };

    const handleConfirmDelete = async () => {
        try {
            console.log('🗑️ Eliminando cuenta...');
            
            const response = await api.deleteAccount();
            
            if (response.success) {
                console.log('✅ Cuenta eliminada');
                
                // Clear all data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                alert('✅ Cuenta eliminada exitosamente');
                navigate('/');
            }
        } catch (error: any) {
            console.error('❌ Error eliminando cuenta:', error);
            alert('❌ Error al eliminar la cuenta: ' + (error.message || 'Error desconocido'));
        }
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            setEditOpen(false);
            setDeleteOpen(false);
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div className="profile-page" style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                minHeight: '50vh'
            }}>
                <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)' }}>
                    Cargando perfil...
                </p>
            </div>
        );
    }

    // Show error if no user
    if (!user) {
        return (
            <div className="profile-page">
                <p style={{ textAlign: 'center', color: '#ff5252' }}>
                    ❌ No se pudo cargar el perfil del usuario
                </p>
            </div>
        );
    }

    // Get user data with fallbacks
    const displayName = user.firstName || user.nombres || 'Usuario';
    const displayLastName = user.lastName || user.apellidos || '';
    const displayEmail = user.email || user.correo || 'email@example.com';
    const displayAge = user.age || user.edad || 0;
    const fullName = `${displayName} ${displayLastName}`.trim();

    return (
        <>
            <div className="profile-page">
                <div className="profile-header">
                    <div className="profile-avatar">
                        <span className="avatar-icon">
                            {displayName.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <h2 className="profile-name">{fullName}</h2>
                </div>

                <div className="profile-details">
                    <p><strong>Email:</strong> {displayEmail}</p>
                    <p><strong>Edad:</strong> {displayAge} años</p>
                    <p><strong>ID:</strong> {user.id}</p>
                </div>

                <div className="profile-actions">
                    <button className="edit-button" onClick={() => setEditOpen(true)}>
                        Edita tu perfil
                    </button>
                    <button className="delete-button" onClick={() => setDeleteOpen(true)}>
                        Elimina tu perfil
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            {editOpen && (
                <div className="modal-overlay" onClick={handleOverlayClick}>
                    <div className="modal-card edit-modal">
                        <button 
                            className="modal-close" 
                            onClick={() => setEditOpen(false)}
                            aria-label="Cerrar modal"
                        >
                            ×
                        </button>
                        <h3>Editar Usuario</h3>
                        <p className="modal-sub">Modifica tu información personal</p>
                        
                        <input 
                            className="form-input" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Nombre" 
                        />
                        <input 
                            className="form-input" 
                            value={lastName} 
                            onChange={(e) => setLastName(e.target.value)} 
                            placeholder="Apellido"
                        />
                        <input 
                            className="form-input" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="Email"
                            type="email"
                            disabled
                            style={{ opacity: 0.6, cursor: 'not-allowed' }}
                        />
                        <input 
                            className="form-input" 
                            value={age} 
                            onChange={(e) => setAge(e.target.value)} 
                            placeholder="Edad"
                            type="number"
                            min="18"
                            max="120"
                        />
                        
                        <p className="modal-sub" style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                            Cambiar contraseña (opcional)
                        </p>
                        
                        <input 
                            className="form-input" 
                            type="password" 
                            placeholder="Nueva Contraseña (mín. 8 caracteres)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <input 
                            className="form-input" 
                            type="password" 
                            placeholder="Confirma Nueva Contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        
                        <div className="modal-actions">
                            <button className="save-button" onClick={handleSave}>
                                Guardar Cambios
                            </button>
                            <button className="cancel-delete" onClick={() => setEditOpen(false)}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteOpen && (
                <div className="modal-overlay" onClick={handleOverlayClick}>
                    <div className="modal-card delete-modal">
                        <button 
                            className="modal-close" 
                            onClick={() => setDeleteOpen(false)}
                            aria-label="Cerrar modal"
                        >
                            ×
                        </button>
                        <h3>Eliminar Usuario</h3>
                        <p>Esta acción eliminará permanentemente tu cuenta y todos tus datos. Esta acción no se puede deshacer.</p>
                        <div className="modal-actions">
                            <button className="confirm-delete" onClick={handleConfirmDelete}>
                                Eliminar
                            </button>
                            <button className="cancel-delete" onClick={() => setDeleteOpen(false)}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfilePage;