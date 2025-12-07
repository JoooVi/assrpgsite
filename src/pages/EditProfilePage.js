import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { updateUser, logout } from '../redux/slices/authSlice';

// Importa o novo CSS Module
import styles from "./EditProfilePage.module.css";

const EditProfilePage = () => {
    const { user, token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState(0); // 0: Profile, 1: Account

    // Form States
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [twitter, setTwitter] = useState('');
    const [twitch, setTwitch] = useState('');
    
    // Avatar
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');

    // Senha & Danger
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [deletePassword, setDeletePassword] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setBio(user.bio || '');
            setTwitter(user.socials?.twitter || '');
            setTwitch(user.socials?.twitch || '');
            setAvatarPreview(user.avatar || '/placeholder-avatar.png'); // Placeholder caso não tenha avatar
        }
    }, [user]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('bio', bio);
        formData.append('socials[twitter]', twitter);
        formData.append('socials[twitch]', twitch);
        if (avatar) formData.append('avatar', avatar);

        try {
            const { data } = await api.put('/profile', formData, {
                 headers: { 'Content-Type': 'multipart/form-data' }
            });
            dispatch(updateUser(data));
            alert('Perfil atualizado com sucesso!');
            navigate('/perfil'); // Retorna ao perfil, mas pode ajustar a rota correta aqui
        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar o perfil.');
        }
    };
    
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return alert('As novas senhas não coincidem.');
        try {
            await api.post('/profile/change-password', 
                { currentPassword, newPassword }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Senha alterada com sucesso!');
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        } catch (error) {
            alert('Erro ao alterar senha. Verifique a senha atual.');
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) return alert("Digite sua senha para confirmar.");
        if (window.confirm('TEM CERTEZA? Esta ação é irreversível e apagará todos os seus dados.')) {
            try {
                await api.delete('/profile/delete-account', { 
                    headers: { Authorization: `Bearer ${token}` }, 
                    data: { password: deletePassword } 
                });
                alert('Conta deletada.');
                dispatch(logout());
                navigate('/login');
            } catch (error) {
                alert('Erro ao deletar conta. Senha incorreta.');
            }
        }
    };

    return (
        <div className={styles.editContainer}>
            <div className={styles.panel}>
                <h1 className={styles.title}>Editar Perfil</h1>
                
                {/* Abas de Navegação */}
                <div className={styles.tabsNav}>
                    <button 
                        className={`${styles.tabBtn} ${activeTab === 0 ? styles.active : ''}`} 
                        onClick={() => setActiveTab(0)}
                    >
                        Perfil Público
                    </button>
                    <button 
                        className={`${styles.tabBtn} ${activeTab === 1 ? styles.active : ''}`} 
                        onClick={() => setActiveTab(1)}
                    >
                        Conta & Segurança
                    </button>
                </div>

                {/* --- ABA 0: Perfil Público --- */}
                {activeTab === 0 && (
                    <form className={styles.formSection} onSubmit={handleProfileSubmit}>
                        
                        {/* Seção Avatar */}
                        <div className={styles.avatarSection}>
                            <img src={avatarPreview} alt="Avatar" className={styles.avatarPreview} />
                            <div>
                                <label htmlFor="avatarInput" className={styles.uploadBtn}>
                                    Alterar Avatar
                                </label>
                                <input 
                                    id="avatarInput" 
                                    type="file" 
                                    accept="image/*" 
                                    hidden 
                                    onChange={handleAvatarChange} 
                                />
                                <div style={{fontSize:'0.75rem', color:'#777', marginTop:'5px'}}>
                                    Recomendado: 500x500px
                                </div>
                            </div>
                        </div>

                        {/* Campos de Texto */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nome de Agente</label>
                            <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Biografia</label>
                            <textarea 
                                className={styles.textarea} 
                                value={bio} 
                                onChange={(e) => setBio(e.target.value)} 
                                placeholder="Conte um pouco sobre você..."
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Link do Twitter / X</label>
                            <input className={styles.input} value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://x.com/usuario" />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Link da Twitch</label>
                            <input className={styles.input} value={twitch} onChange={(e) => setTwitch(e.target.value)} placeholder="https://twitch.tv/usuario" />
                        </div>

                        <button type="submit" className={`${styles.btn} ${styles.primaryBtn}`}>Salvar Alterações</button>
                    </form>
                )}

                {/* --- ABA 1: Conta & Segurança --- */}
                {activeTab === 1 && (
                    <div className={styles.formSection}>
                        
                        <form onSubmit={handlePasswordSubmit}>
                            <h3 className={styles.subTitle}>Alterar Senha</h3>
                            <div className={styles.formGroup} style={{marginBottom:'15px'}}>
                                <label className={styles.label}>Senha Atual</label>
                                <input type="password" className={styles.input} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                            </div>
                            <div className={styles.formGroup} style={{marginBottom:'15px'}}>
                                <label className={styles.label}>Nova Senha</label>
                                <input type="password" className={styles.input} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                            </div>
                            <div className={styles.formGroup} style={{marginBottom:'20px'}}>
                                <label className={styles.label}>Confirmar Nova Senha</label>
                                <input type="password" className={styles.input} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                            </div>
                            <button type="submit" className={styles.btn}>Atualizar Senha</button>
                        </form>

                        <div className={styles.divider}></div>

                        <div className={styles.dangerZone}>
                            <h3 className={styles.dangerTitle}>Zona de Perigo</h3>
                            <p className={styles.dangerDesc}>
                                A exclusão da conta é permanente e removerá todos os seus personagens e homebrews do sistema.
                            </p>
                            <div className={styles.formGroup}>
                                <label className={styles.label} style={{color:'#ff8a80'}}>Digite sua senha para confirmar</label>
                                <input 
                                    type="password" 
                                    className={styles.input} 
                                    value={deletePassword} 
                                    onChange={(e) => setDeletePassword(e.target.value)} 
                                    style={{borderColor: '#b71c1c'}}
                                />
                            </div>
                            <button type="button" className={`${styles.btn} ${styles.dangerBtn}`} onClick={handleDeleteAccount}>
                                Deletar Minha Conta
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default EditProfilePage;