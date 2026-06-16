// Supabase kütüphanesini doğrudan tarayıcıya (CDN üzerinden) çekiyoruz
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// KEY VE URL BİLGİLERİ (Projendeki mevcut keyler)
const supabaseUrl = "https://ppdwtpjglkphayfxexhv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwZHd0cGpnbGtwaGF5ZnhleGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNTc5ODEsImV4cCI6MjA5NjgzMzk4MX0.fJIyyxfU15EgrNARWkISFHJvU7-o-QpZbIKbRc3q_-s";

const supabase = createClient(supabaseUrl, supabaseKey);

// DOM ELEMENTLERİ
const authContainer = document.getElementById('auth-container');
const dashboardContainer = document.getElementById('dashboard-container');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');

const logoutBtn = document.getElementById('logout-btn');

// PROFİL FOTOĞRAFI SEÇİMİ VE ÖNİZLEME (YENİ EKLENDİ)
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
    registerForm.classList.remove('hidden');
});

showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.add('hidden');
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
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Fotoğraf Yükleniyor ve Kayıt Yapılıyor...';
    btn.disabled = true;

    try {
        // A) Supabase Auth sistemine kullanıcıyı kaydet
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (authError) throw authError;

        let finalAvatarUrl = null;

        // B) Eğer profil fotoğrafı seçildiyse Supabase Storage'a Yükle
        if (selectedAvatarFile && authData.user) {
            const fileExt = selectedAvatarFile.name.split('.').pop();
            const fileName = `${authData.user.id}-${Math.random()}.${fileExt}`; // Eşsiz isim
            
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, selectedAvatarFile);

            if (!uploadError) {
                // Yükleme başarılıysa herkese açık URL'yi al
                const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
                finalAvatarUrl = publicUrlData.publicUrl;
            } else {
                console.error("Fotoğraf yükleme hatası:", uploadError);
            }
        }

        // C) Kendi 'uyeler' tablomuza ekstra bilgileri ve fotoğraf linkini ekleyelim
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
            
            if (dbError) {
                console.error("Tabloya yazma hatası:", dbError);
            }
        }

        Swal.fire({ icon: 'success', title: 'Kayıt Başarılı', text: 'Hesabınız oluşturuldu. Şimdi giriş yapabilirsiniz.' });
        
        // Formu temizle ve resetle
        registerForm.reset();
        selectedAvatarFile = null;
        avatarPreview.innerHTML = '<i class="fa-solid fa-camera text-2xl text-slate-400 group-hover:text-blue-500 transition-colors"></i>';
        
        // Giriş formuna geri dön
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
        
        // Başarılı giriş sonrası paneli göster
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

// 3. ÇIKIŞ YAPMA (SIGN OUT) İŞLEMİ
logoutBtn.addEventListener('click', async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        // Paneli gizle, giriş ekranını göster
        authContainer.classList.remove('hidden');
        dashboardContainer.classList.add('hidden');
        
    } catch (error) {
        console.error("Çıkış hatası:", error);
    }
});

// 4. OTURUM KONTROLÜ VE PANEL VERİLERİNİ DOLDURMA
async function checkSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session) {
        // Paneli göster
        authContainer.classList.add('hidden');
        dashboardContainer.classList.remove('hidden');
        
        // Temel email bilgisini yaz
        document.getElementById('dash-email').innerText = session.user.email;

        // UYELER tablosundan Ad, Rol ve Profil Fotoğrafını çekelim
        const { data: userData, error: userError } = await supabase
            .from('uyeler')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (userData && !userError) {
            document.getElementById('dash-name').innerText = userData.ad_soyad;
            document.getElementById('dash-role').innerText = userData.rol;
            
            // Eğer avatar varsa onu, yoksa varsayılan resmi göster
            if (userData.avatar_url) {
                document.getElementById('dash-avatar').src = userData.avatar_url;
            } else {
                document.getElementById('dash-avatar').src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.ad_soyad) + '&background=1e3a8a&color=fff';
            }
        } else {
            // Tabloda bulamazsa yedek (fallback) gösterim
            document.getElementById('dash-name').innerText = "Kullanıcı";
            document.getElementById('dash-role').innerText = "Müşteri";
        }

    } else {
        // Giriş yapılmamış, formu göster
        authContainer.classList.remove('hidden');
        dashboardContainer.classList.add('hidden');
    }
}

// Sayfa yüklendiğinde oturumu kontrol et
document.addEventListener('DOMContentLoaded', checkSession);

// Supabase oturum durumunu sürekli dinler
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        checkSession();
    }
});
