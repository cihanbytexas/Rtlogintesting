// Supabase kütüphanesini doğrudan tarayıcıya (CDN üzerinden) çekiyoruz
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// KEY VE URL BİLGİLERİ
const supabaseUrl = "https://ppdwtpjglkphayfxexhv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwZHd0cGpnbGtwaGF5ZnhleGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNTc5ODEsImV4cCI6MjA5NjgzMzk4MX0.fJIyyxfU15EgrNARWkISFHJvU7-o-QpZbIKbRc3q_-s";

const supabase = createClient(supabaseUrl, supabaseKey);

// DOM ELEMENTLERİ - Temel
const authContainer = document.getElementById('auth-container');
const dashboardContainer = document.getElementById('dashboard-container');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const forgotPasswordForm = document.getElementById('forgot-password-form');
const resetPasswordForm = document.getElementById('reset-password-form');

const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
const showForgotPasswordBtn = document.getElementById('show-forgot-password');
const backToLoginBtn = document.getElementById('back-to-login');
const logoutBtn = document.getElementById('logout-btn');

// DOM ELEMENTLERİ - Profil Düzenleme
const dashboardView = document.getElementById('dashboard-view');
const editProfileForm = document.getElementById('edit-profile-form');
const editProfileBtn = document.getElementById('edit-profile-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const editAvatarInput = document.getElementById('edit-avatar');
const editAvatarImg = document.getElementById('edit-avatar-img');
const editNameInput = document.getElementById('edit-name');
let selectedUpdateAvatarFile = null;

// PROFİL FOTOĞRAFI SEÇİMİ VE ÖNİZLEME (Kayıt Ekranı)
const avatarInput = document.getElementById('reg-avatar');
const avatarPreview = document.getElementById('avatar-preview');
let selectedAvatarFile = null;

avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        selectedAvatarFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            avatarPreview.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
        };
        reader.readAsDataURL(file);
    }
});

// FORM GEÇİŞ EFEKTLERİ
showRegisterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    forgotPasswordForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
});

showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.add('hidden');
    forgotPasswordForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});

showForgotPasswordBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    forgotPasswordForm.classList.remove('hidden');
});

backToLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    forgotPasswordForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});

// 1. KAYIT OLMA (SIGN UP) İŞLEMİ
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('reg-name').value;
    const role = document.getElementById('reg-role').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const btn = document.getElementById('register-btn');
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> İşlem Yapılıyor...';
    btn.disabled = true;

    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (authError) throw authError;

        let finalAvatarUrl = null;

        if (selectedAvatarFile && authData.user) {
            const fileExt = selectedAvatarFile.name.split('.').pop();
            const fileName = `${authData.user.id}-${Math.random()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, selectedAvatarFile);

            if (!uploadError) {
                const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
                finalAvatarUrl = publicUrlData.publicUrl;
            } else {
                console.error("Fotoğraf yükleme hatası:", uploadError);
            }
        }

        if (authData.user) {
            const { error: dbError } = await supabase
                .from('uyeler')
                .insert([
                    { 
                        id: authData.user.id, 
                        ad_soyad: name, 
                        rol: role,
                        avatar_url: finalAvatarUrl 
                    }
                ]);
            
            if (dbError) console.error("Tabloya yazma hatası:", dbError);
        }

        Swal.fire({ icon: 'success', title: 'Kayıt Başarılı', text: 'Hesabınız oluşturuldu. Şimdi giriş yapabilirsiniz.' });
        
        registerForm.reset();
        selectedAvatarFile = null;
        avatarPreview.innerHTML = '<i class="fa-solid fa-camera text-2xl text-slate-400 group-hover:text-blue-500 transition-colors"></i>';
        
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');

    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Hata', text: error.message });
    } finally {
        btn.innerHTML = 'Kayıt Ol';
        btn.disabled = false;
    }
});

// 2. GİRİŞ YAPMA (SIGN IN) İŞLEMİ
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Bekleyin...';
    btn.disabled = true;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        Swal.fire({ icon: 'success', title: 'Hoş Geldiniz', text: 'Giriş başarılı!', timer: 1500, showConfirmButton: false });
        loginForm.reset();
        
        checkSession();

    } catch (error) {
        let msg = error.message;
        if(msg.includes('Invalid login credentials')) msg = "E-posta veya şifre hatalı!";
        Swal.fire({ icon: 'error', title: 'Giriş Başarısız', text: msg });
    } finally {
        btn.innerHTML = 'Giriş Yap';
        btn.disabled = false;
    }
});

// 3. ŞİFRE SIFIRLAMA LİNKİ GÖNDERME
forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('forgot-email').value;
    const btn = document.getElementById('forgot-btn');
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Link Gönderiliyor...';
    btn.disabled = true;

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin
        });

        if (error) throw error;

        Swal.fire({ 
            icon: 'success', 
            title: 'Bağlantı Gönderildi', 
            text: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. (Gelen kutunuzda yoksa Spam klasörünü kontrol edin.)' 
        });
        
        forgotPasswordForm.reset();
        forgotPasswordForm.classList.add('hidden');
        loginForm.classList.remove('hidden');

    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Hata', text: error.message });
    } finally {
        btn.innerHTML = 'Sıfırlama Linki Gönder';
        btn.disabled = false;
    }
});

// 4. YENİ ŞİFREYİ KAYDETME
resetPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newPassword = document.getElementById('new-password').value;
    const btn = document.getElementById('reset-btn');
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Şifre Güncelleniyor...';
    btn.disabled = true;

    try {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;

        Swal.fire({ 
            icon: 'success', 
            title: 'Başarılı', 
            text: 'Şifreniz başarıyla güncellendi! Panelinize yönlendiriliyorsunuz.',
            timer: 2000, 
            showConfirmButton: false 
        });
        
        resetPasswordForm.reset();
        checkSession();

    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Hata', text: error.message });
    } finally {
        btn.innerHTML = 'Şifremi Güncelle';
        btn.disabled = false;
    }
});

// 5. PROFİL DÜZENLEME İŞLEMLERİ (YENİ EKLENDİ)

// Düzenleme Görünümüne Geçiş
editProfileBtn.addEventListener('click', () => {
    dashboardView.classList.add('hidden');
    editProfileForm.classList.remove('hidden');
    
    // Formu mevcut verilerle doldur
    editNameInput.value = document.getElementById('dash-name').innerText;
    editAvatarImg.src = document.getElementById('dash-avatar').src;
    selectedUpdateAvatarFile = null;
});

// Düzenlemeyi İptal Etme
cancelEditBtn.addEventListener('click', () => {
    editProfileForm.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    selectedUpdateAvatarFile = null;
});

// Düzenleme Ekranı Fotoğraf Önizleme
editAvatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        selectedUpdateAvatarFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            editAvatarImg.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Profili Kaydetme İşlemi
editProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newName = editNameInput.value;
    const btn = document.getElementById('save-edit-btn');
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Kaydediliyor...';
    btn.disabled = true;

    try {
        // Oturum Kontrolü
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) throw new Error("Oturum bulunamadı, lütfen tekrar giriş yapın.");

        let updatedAvatarUrl = null;

        // Fotoğraf değiştiyse yeni fotoğrafı Storage'a yükle
        if (selectedUpdateAvatarFile) {
            const fileExt = selectedUpdateAvatarFile.name.split('.').pop();
            const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, selectedUpdateAvatarFile);

            if (uploadError) throw uploadError;

            // Yüklenen fotoğrafın linkini al
            const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
            updatedAvatarUrl = publicUrlData.publicUrl;
        }

        // Tabloyu güncelle (Sadece isim veya hem isim hem fotoğraf linki)
        const updateData = { ad_soyad: newName };
        if (updatedAvatarUrl) {
            updateData.avatar_url = updatedAvatarUrl;
        }

        const { error: updateError } = await supabase
            .from('uyeler')
            .update(updateData)
            .eq('id', session.user.id);

        if (updateError) throw updateError;

        Swal.fire({ icon: 'success', title: 'Başarılı', text: 'Profiliniz başarıyla güncellendi.', timer: 1500, showConfirmButton: false });
        
        // Görünümü eski haline döndür
        editProfileForm.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        
        // Verileri yeniden çekip ekrana bas
        checkSession();

    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Hata', text: error.message });
    } finally {
        btn.innerHTML = 'Değişiklikleri Kaydet';
        btn.disabled = false;
    }
});

// 6. ÇIKIŞ YAPMA (SIGN OUT) İŞLEMİ
logoutBtn.addEventListener('click', async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        authContainer.classList.remove('hidden');
        dashboardContainer.classList.add('hidden');
        
    } catch (error) {
        console.error("Çıkış hatası:", error);
    }
});

// 7. OTURUM KONTROLÜ VE PANEL VERİLERİNİ DOLDURMA
async function checkSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session) {
        authContainer.classList.add('hidden');
        dashboardContainer.classList.remove('hidden');
        resetPasswordForm.classList.add('hidden');
        
        document.getElementById('dash-email').innerText = session.user.email;

        const { data: userData, error: userError } = await supabase
            .from('uyeler')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (userData && !userError) {
            document.getElementById('dash-name').innerText = userData.ad_soyad;
            document.getElementById('dash-role').innerText = userData.rol;
            
            if (userData.avatar_url) {
                document.getElementById('dash-avatar').src = userData.avatar_url;
            } else {
                document.getElementById('dash-avatar').src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.ad_soyad) + '&background=1e3a8a&color=fff';
            }
        } else {
            document.getElementById('dash-name').innerText = "Kullanıcı";
            document.getElementById('dash-role').innerText = "Müşteri";
        }

    } else {
        authContainer.classList.remove('hidden');
        dashboardContainer.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        editProfileForm.classList.add('hidden');
    }
}

// Sayfa yüklendiğinde oturumu kontrol et
document.addEventListener('DOMContentLoaded', checkSession);

// Supabase oturum durumunu sürekli dinler
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
        authContainer.classList.remove('hidden');
        dashboardContainer.classList.add('hidden');
        loginForm.classList.add('hidden');
        registerForm.classList.add('hidden');
        forgotPasswordForm.classList.add('hidden');
        resetPasswordForm.classList.remove('hidden');
    } else if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        checkSession();
    }
});
