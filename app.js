import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// KEY VE URL BİLGİLERİ
const supabaseUrl = "https://ppdwtpjglkphayfxexhv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwZHd0cGpnbGtwaGF5ZnhleGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNTc5ODEsImV4cCI6MjA5NjgzMzk4MX0.fJIyyxfU15EgrNARWkISFHJvU7-o-QpZbIKbRc3q_-s";

const supabase = createClient(supabaseUrl, supabaseKey);

// --- DOM ELEMENTLERİ (AUTH & PROFİL) ---
const authContainer = document.getElementById('auth-container');
const mainAppContainer = document.getElementById('main-app-container');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const forgotPasswordForm = document.getElementById('forgot-password-form');
const resetPasswordForm = document.getElementById('reset-password-form');

const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
const showForgotPasswordBtn = document.getElementById('show-forgot-password');
const backToLoginBtn = document.getElementById('back-to-login');
const logoutBtn = document.getElementById('logout-btn');

const dashboardView = document.getElementById('dashboard-view');
const editProfileForm = document.getElementById('edit-profile-form');
const editProfileBtn = document.getElementById('edit-profile-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const editAvatarInput = document.getElementById('edit-avatar');
const editAvatarImg = document.getElementById('edit-avatar-img');
const editNameInput = document.getElementById('edit-name');

const avatarInput = document.getElementById('reg-avatar');
const avatarPreview = document.getElementById('avatar-preview');
let selectedAvatarFile = null;
let selectedUpdateAvatarFile = null;

let currentUserSession = null;

// --- DOM ELEMENTLERİ (TOPLULUK AKIŞI) ---
const feedList = document.getElementById('feed-list');
const feedFilters = document.querySelectorAll('.feed-filter');
const openCreatePostBtn = document.getElementById('open-create-post');
const createPostModal = document.getElementById('create-post-modal');
const closePostModalBtn = document.getElementById('close-post-modal');
const createPostForm = document.getElementById('create-post-form');
const postTypeRadios = document.getElementsByName('post_type');
const mediaUploadContainer = document.getElementById('media-upload-container');
const postMediaInput = document.getElementById('post-media');
const postTextInput = document.getElementById('post-text');
const submitPostBtn = document.getElementById('submit-post-btn');

let currentFeedFilter = 'all';

// --- AUTH & FORM GEÇİŞ EFEKTLERİ ---
avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        selectedAvatarFile = file;
        const reader = new FileReader();
        reader.onload = (e) => avatarPreview.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
        reader.readAsDataURL(file);
    }
});

showRegisterBtn.addEventListener('click', (e) => { e.preventDefault(); toggleAuthForms(registerForm); });
showLoginBtn.addEventListener('click', (e) => { e.preventDefault(); toggleAuthForms(loginForm); });
showForgotPasswordBtn.addEventListener('click', (e) => { e.preventDefault(); toggleAuthForms(forgotPasswordForm); });
backToLoginBtn.addEventListener('click', (e) => { e.preventDefault(); toggleAuthForms(loginForm); });

function toggleAuthForms(activeForm) {
    [loginForm, registerForm, forgotPasswordForm, resetPasswordForm].forEach(f => f.classList.add('hidden'));
    activeForm.classList.remove('hidden');
}

// 1. KAYIT OLMA (SIGN UP)
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
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;

        let finalAvatarUrl = null;
        if (selectedAvatarFile && authData.user) {
            const ext = selectedAvatarFile.name.split('.').pop();
            const fileName = `${authData.user.id}-${Math.random()}.${ext}`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, selectedAvatarFile);
            if (!uploadError) finalAvatarUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl;
        }

        if (authData.user) {
            await supabase.from('uyeler').insert([{ id: authData.user.id, ad_soyad: name, rol: role, avatar_url: finalAvatarUrl }]);
        }

        Swal.fire({ icon: 'success', title: 'Başarılı', text: 'Kayıt olundu, giriş yapabilirsiniz.' });
        registerForm.reset();
        selectedAvatarFile = null;
        avatarPreview.innerHTML = '<i class="fa-solid fa-camera text-2xl text-slate-400 group-hover:text-blue-500 transition-colors"></i>';
        toggleAuthForms(loginForm);
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Hata', text: error.message });
    } finally {
        btn.innerHTML = 'Kayıt Ol';
        btn.disabled = false;
    }
});

// 2. GİRİŞ YAPMA
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Bekleyin...';
    btn.disabled = true;

    try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        loginForm.reset();
        checkSession();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Başarısız', text: "E-posta veya şifre hatalı!" });
    } finally {
        btn.innerHTML = 'Giriş Yap';
        btn.disabled = false;
    }
});

// 3. ŞİFRE SIFIRLAMA
forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    const btn = document.getElementById('forgot-btn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Link Gönderiliyor...';
    btn.disabled = true;
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        if (error) throw error;
        Swal.fire({ icon: 'success', title: 'Gönderildi', text: 'Sıfırlama bağlantısı e-postanıza iletildi.' });
        forgotPasswordForm.reset();
        toggleAuthForms(loginForm);
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Hata', text: error.message });
    } finally {
        btn.innerHTML = 'Sıfırlama Linki Gönder';
        btn.disabled = false;
    }
});

resetPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('new-password').value;
    const btn = document.getElementById('reset-btn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Güncelleniyor...';
    btn.disabled = true;
    try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        Swal.fire({ icon: 'success', title: 'Başarılı', text: 'Şifreniz güncellendi!', timer: 1500, showConfirmButton: false });
        resetPasswordForm.reset();
        checkSession();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Hata', text: error.message });
    } finally {
        btn.innerHTML = 'Şifremi Güncelle';
        btn.disabled = false;
    }
});

// 4. PROFİL DÜZENLEME
editProfileBtn.addEventListener('click', () => {
    dashboardView.classList.add('hidden');
    editProfileForm.classList.remove('hidden');
    editNameInput.value = document.getElementById('dash-name').innerText;
    editAvatarImg.src = document.getElementById('dash-avatar').src;
    selectedUpdateAvatarFile = null;
});

cancelEditBtn.addEventListener('click', () => {
    editProfileForm.classList.add('hidden');
    dashboardView.classList.remove('hidden');
});

editAvatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        selectedUpdateAvatarFile = file;
        const reader = new FileReader();
        reader.onload = (e) => editAvatarImg.src = e.target.result;
        reader.readAsDataURL(file);
    }
});

editProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newName = editNameInput.value;
    const btn = document.getElementById('save-edit-btn');
    btn.innerHTML = 'Kaydediliyor...';
    btn.disabled = true;

    try {
        if (!currentUserSession) throw new Error("Oturum bulunamadı.");
        let updatedAvatarUrl = null;

        if (selectedUpdateAvatarFile) {
            const ext = selectedUpdateAvatarFile.name.split('.').pop();
            const fileName = `${currentUserSession.user.id}-${Math.random()}.${ext}`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, selectedUpdateAvatarFile);
            if (uploadError) throw uploadError;
            updatedAvatarUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl;
        }

        const updateData = { ad_soyad: newName };
        if (updatedAvatarUrl) updateData.avatar_url = updatedAvatarUrl;

        const { error } = await supabase.from('uyeler').update(updateData).eq('id', currentUserSession.user.id);
        if (error) throw error;

        editProfileForm.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        checkSession();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Hata', text: error.message });
    } finally {
        btn.innerHTML = 'Kaydet';
        btn.disabled = false;
    }
});

// ÇIKIŞ
logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    mainAppContainer.classList.add('hidden');
    authContainer.classList.remove('hidden');
});

// OTURUM KONTROLÜ
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        currentUserSession = session;
        authContainer.classList.add('hidden');
        mainAppContainer.classList.remove('hidden');
        document.getElementById('dash-email').innerText = session.user.email;

        const { data: userData } = await supabase.from('uyeler').select('*').eq('id', session.user.id).single();
        if (userData) {
            document.getElementById('dash-name').innerText = userData.ad_soyad;
            document.getElementById('dash-role').innerText = userData.rol;
            document.getElementById('dash-avatar').src = userData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.ad_soyad)}&background=1e3a8a&color=fff`;
        }
        // Oturum açılınca akışı yükle
        loadFeed(currentFeedFilter);
    } else {
        currentUserSession = null;
        mainAppContainer.classList.add('hidden');
        authContainer.classList.remove('hidden');
        toggleAuthForms(loginForm);
    }
}

document.addEventListener('DOMContentLoaded', checkSession);
supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') toggleAuthForms(resetPasswordForm);
    else if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') checkSession();
});

// ==========================================
// YENİ: TOPLULUK AKIŞI (FEED) MANTIĞI
// ==========================================

// Gönderi Tipi Seçimi (Radyo Butonları)
postTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if(e.target.value === 'medya') {
            mediaUploadContainer.classList.remove('hidden');
        } else {
            mediaUploadContainer.classList.add('hidden');
            postMediaInput.value = ''; // Seçimi sıfırla
        }
    });
});

// Modal Aç/Kapat
openCreatePostBtn.addEventListener('click', () => {
    createPostModal.classList.remove('hidden');
});

closePostModalBtn.addEventListener('click', () => {
    createPostModal.classList.add('hidden');
    createPostForm.reset();
    mediaUploadContainer.classList.add('hidden');
});

// Yeni Gönderi Paylaşma
createPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if(!currentUserSession) return;

    const postType = document.querySelector('input[name="post_type"]:checked').value;
    const text = postTextInput.value;
    const file = postMediaInput.files[0];
    
    submitPostBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Paylaşılıyor...';
    submitPostBtn.disabled = true;

    try {
        let finalMediaUrl = null;

        // Eğer medya seçildiyse 'medya' bucket'ına yükle
        if (postType === 'medya' && file) {
            const ext = file.name.split('.').pop();
            const fileName = `post-${Date.now()}-${Math.random()}.${ext}`;
            const { error: uploadError } = await supabase.storage.from('medya').upload(fileName, file);
            
            if (uploadError) throw new Error("Medya yüklenemedi: " + uploadError.message);
            finalMediaUrl = supabase.storage.from('medya').getPublicUrl(fileName).data.publicUrl;
        }

        // Veritabanına Yaz
        const { error: dbError } = await supabase.from('gonderiler').insert([{
            user_id: currentUserSession.user.id,
            gonderi_tipi: postType,
            metin: text,
            medya_url: finalMediaUrl
        }]);

        if (dbError) throw dbError;

        createPostModal.classList.add('hidden');
        createPostForm.reset();
        mediaUploadContainer.classList.add('hidden');
        
        // Akışı yenile
        loadFeed(currentFeedFilter);
        Swal.fire({ icon: 'success', title: 'Paylaşıldı!', timer: 1500, showConfirmButton: false });

    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Hata', text: error.message });
    } finally {
        submitPostBtn.innerHTML = 'Paylaş';
        submitPostBtn.disabled = false;
    }
});

// Akış Filtreleme Tıklamaları
feedFilters.forEach(btn => {
    btn.addEventListener('click', (e) => {
        feedFilters.forEach(f => {
            f.classList.remove('bg-slate-800', 'text-white');
            f.classList.add('bg-slate-100', 'text-slate-600');
        });
        e.target.classList.remove('bg-slate-100', 'text-slate-600');
        e.target.classList.add('bg-slate-800', 'text-white');
        
        currentFeedFilter = e.target.getAttribute('data-filter');
        loadFeed(currentFeedFilter);
    });
});

// Gönderileri Supabase'den Çek ve Ekrana Bas
async function loadFeed(filterType) {
    feedList.innerHTML = '<div class="p-8 text-center text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><p>Yükleniyor...</p></div>';

    try {
        // Gönderileri ve yazarların bilgilerini beraber çekiyoruz
        let query = supabase
            .from('gonderiler')
            .select(`
                *,
                yazar:uyeler (ad_soyad, avatar_url, rol)
            `)
            .order('created_at', { ascending: false });

        if (filterType !== 'all') {
            query = query.eq('gonderi_tipi', filterType);
        }

        const { data: posts, error } = await query;
        if (error) throw error;

        if (!posts || posts.length === 0) {
            feedList.innerHTML = `<div class="p-8 text-center text-slate-500"><i class="fa-regular fa-folder-open text-3xl mb-2"></i><p>Buralar henüz çok sessiz. İlk paylaşımı sen yap!</p></div>`;
            return;
        }

        feedList.innerHTML = '';
        
        posts.forEach(post => {
            const author = post.yazar || {};
            const avatar = author.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.ad_soyad || 'U')}&background=1e3a8a&color=fff`;
            
            // Tarih Formatı (Örn: 2 saat önce)
            const dateStr = new Date(post.created_at).toLocaleDateString('tr-TR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });

            // Medya alanı
            let mediaHTML = '';
            if (post.gonderi_tipi === 'medya' && post.medya_url) {
                // Basit bir kontrol ile mp4 ise video etiketi basılabilir. Şimdilik görsel varsayıyoruz.
                if(post.medya_url.endsWith('.mp4')) {
                    mediaHTML = `<video controls class="w-full h-auto max-h-96 object-cover bg-black mt-3 rounded-xl"><source src="${post.medya_url}" type="video/mp4"></video>`;
                } else {
                    mediaHTML = `<img src="${post.medya_url}" class="w-full h-auto max-h-96 object-cover bg-slate-100 mt-3 rounded-xl border border-slate-100">`;
                }
            }

            const postHTML = `
                <div class="p-5 hover:bg-slate-50 transition-colors">
                    <div class="flex items-center gap-3 mb-3">
                        <img src="${avatar}" class="w-10 h-10 rounded-full object-cover border border-slate-200">
                        <div>
                            <h4 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                                ${author.ad_soyad || 'Bilinmeyen Kullanıcı'}
                                <span class="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] uppercase tracking-wide border border-blue-100">${author.rol || 'Müşteri'}</span>
                            </h4>
                            <p class="text-[11px] text-slate-400">${dateStr}</p>
                        </div>
                    </div>
                    
                    <div class="text-slate-700 text-sm whitespace-pre-wrap">${post.metin}</div>
                    ${mediaHTML}
                    
                    <div class="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100">
                        <button class="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors text-sm font-semibold">
                            <i class="fa-regular fa-heart text-lg"></i> <span>Beğen</span>
                        </button>
                        <button class="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors text-sm font-semibold">
                            <i class="fa-regular fa-comment text-lg"></i> <span>Yanıtla</span>
                        </button>
                    </div>
                </div>
            `;
            feedList.insertAdjacentHTML('beforeend', postHTML);
        });

    } catch (error) {
        console.error("Akış yükleme hatası:", error);
        feedList.innerHTML = `<div class="p-8 text-center text-red-500"><p>Gönderiler yüklenirken hata oluştu.</p></div>`;
    }
}
