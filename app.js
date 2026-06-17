import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// KEY VE URL BİLGİLERİ
const supabaseUrl = "https://ppdwtpjglkphayfxexhv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwZHd0cGpnbGtwaGF5ZnhleGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNTc5ODEsImV4cCI6MjA5NjgzMzk4MX0.fJIyyxfU15EgrNARWkISFHJvU7-o-QpZbIKbRc3q_-s";

const supabase = createClient(supabaseUrl, supabaseKey);

// --- DOM ELEMENTLERİ ---
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

const notificationBtn = document.getElementById('notification-btn');
const notificationBadge = document.getElementById('notification-badge');
const notificationModal = document.getElementById('notification-modal');
const closeNotificationModalBtn = document.getElementById('close-notification-modal');
const notificationList = document.getElementById('notification-list');

let currentFeedFilter = 'all';
let activeReplyData = {}; 

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

// 1. KAYIT OLMA
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
        loadFeed(currentFeedFilter);
        checkNotificationsBadge();
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
// BİLDİRİM SİSTEMİ VE YÖNLENDİRME MANTIĞI
// ==========================================
async function checkNotificationsBadge() {
    if (!currentUserSession) return;
    try {
        const { count, error } = await supabase
            .from('bildirimler')
            .select('*', { count: 'exact', head: true })
            .eq('alici_id', currentUserSession.user.id)
            .eq('okundu', false);
        
        if (error) throw error;
        if (count > 0) notificationBadge.classList.remove('hidden');
        else notificationBadge.classList.add('hidden');
    } catch (error) { console.error("Bildirim rozeti hatası:", error); }
}

notificationBtn.addEventListener('click', async () => {
    notificationModal.classList.remove('hidden');
    notificationList.innerHTML = '<div class="text-center text-slate-400 mt-10"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><p>Bildirimler yükleniyor...</p></div>';
    
    try {
        const { data: notifications, error } = await supabase
            .from('bildirimler')
            .select('*, gonderen:uyeler!gonderen_id(ad_soyad, avatar_url)')
            .eq('alici_id', currentUserSession.user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        if (!notifications || notifications.length === 0) {
            notificationList.innerHTML = `<div class="text-center text-slate-500 mt-10"><i class="fa-regular fa-bell-slash text-3xl mb-2"></i><p>Henüz yeni bildiriminiz yok.</p></div>`;
            return;
        }

        notificationList.innerHTML = '';
        notifications.forEach(notif => {
            const sender = notif.gonderen || {};
            const avatar = sender.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(sender.ad_soyad || 'U')}&background=1e3a8a&color=fff`;
            const isReadClass = notif.okundu ? 'bg-white' : 'bg-blue-50 border border-blue-100';
            const dotClass = notif.okundu ? 'hidden' : 'block';

            // DİKKAT: Yönlendirme fonksiyonu güncellendi (goToPost)
            const notifHTML = `
                <div class="p-3 rounded-xl flex items-start gap-3 relative cursor-pointer hover:bg-slate-100 transition-colors ${isReadClass}" onclick="goToPost(${notif.id}, ${notif.gonderi_id})">
                    <span class="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full ${dotClass}"></span>
                    <img src="${avatar}" class="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0">
                    <div class="flex-1 pr-4">
                        <p class="text-sm text-slate-800"><span class="font-bold">${sender.ad_soyad}</span> ${notif.mesaj}</p>
                        <p class="text-[10px] text-slate-400 mt-1">${new Date(notif.created_at).toLocaleDateString('tr-TR', { hour:'2-digit', minute:'2-digit', day:'numeric', month:'short' })}</p>
                    </div>
                </div>
            `;
            notificationList.insertAdjacentHTML('beforeend', notifHTML);
        });

    } catch (error) {
        console.error("Bildirim yükleme hatası:", error);
        notificationList.innerHTML = `<p class="text-center text-red-500">Bildirimler yüklenemedi.</p>`;
    }
});

closeNotificationModalBtn.addEventListener('click', () => {
    notificationModal.classList.add('hidden');
    checkNotificationsBadge(); 
});

// YENİ: Bildirime Tıklanınca Gönderiye Gitme Fonksiyonu
window.goToPost = async (notificationId, postId) => {
    try {
        // 1. Bildirimi okundu olarak işaretle
        await supabase.from('bildirimler').update({ okundu: true }).eq('id', notificationId);
        
        // 2. Modalı kapat ve zile güncelleme yap
        notificationModal.classList.add('hidden');
        checkNotificationsBadge();

        // 3. Yanlış sekmedeysek (Örn: Sadece Sorular'daysak) sekmeyi Tümü'ne çekip akışı yeniliyoruz
        feedFilters.forEach(f => {
            f.classList.remove('bg-slate-800', 'text-white');
            f.classList.add('bg-white', 'text-slate-600', 'border-slate-200');
        });
        document.querySelector('.feed-filter[data-filter="all"]').classList.add('bg-slate-800', 'text-white');
        document.querySelector('.feed-filter[data-filter="all"]').classList.remove('bg-white', 'text-slate-600', 'border-slate-200');
        currentFeedFilter = 'all';

        // 4. Gönderilerin tamamen yüklendiğinden emin oluyoruz
        await loadFeed('all');

        // 5. Sayfayı yağ gibi gönderiye kaydır ve dikkat çekmesi için etrafında mavi ışık yak
        const targetPost = document.getElementById(`post-${postId}`);
        if (targetPost) {
            targetPost.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Görsel efekt (Highlight)
            targetPost.classList.add('ring-4', 'ring-blue-300', 'shadow-lg');
            setTimeout(() => {
                targetPost.classList.remove('ring-4', 'ring-blue-300', 'shadow-lg');
            }, 2000); // 2 saniye sonra ışık söner
        }

    } catch (err) { 
        console.error("Yönlendirme hatası:", err); 
    }
};

// ==========================================
// TOPLULUK AKIŞI VE GÖNDERİ PAYLAŞMA
// ==========================================
postTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if(e.target.value === 'medya') {
            mediaUploadContainer.classList.remove('hidden');
        } else {
            mediaUploadContainer.classList.add('hidden');
            postMediaInput.value = ''; 
        }
    });
});

openCreatePostBtn.addEventListener('click', () => createPostModal.classList.remove('hidden'));
closePostModalBtn.addEventListener('click', () => {
    createPostModal.classList.add('hidden');
    createPostForm.reset();
    mediaUploadContainer.classList.add('hidden');
});

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
        if (postType === 'medya' && file) {
            const ext = file.name.split('.').pop();
            const fileName = `post-${Date.now()}-${Math.random()}.${ext}`;
            const { error: uploadError } = await supabase.storage.from('medya').upload(fileName, file);
            if (uploadError) throw new Error("Medya yüklenemedi: " + uploadError.message);
            finalMediaUrl = supabase.storage.from('medya').getPublicUrl(fileName).data.publicUrl;
        }

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
        loadFeed(currentFeedFilter);
        Swal.fire({ icon: 'success', title: 'Paylaşıldı!', timer: 1500, showConfirmButton: false });
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Hata', text: error.message });
    } finally {
        submitPostBtn.innerHTML = 'Paylaş';
        submitPostBtn.disabled = false;
    }
});

feedFilters.forEach(btn => {
    btn.addEventListener('click', (e) => {
        feedFilters.forEach(f => {
            f.classList.remove('bg-slate-800', 'text-white');
            f.classList.add('bg-white', 'text-slate-600', 'border-slate-200');
        });
        e.target.classList.remove('bg-white', 'text-slate-600', 'border-slate-200');
        e.target.classList.add('bg-slate-800', 'text-white');
        currentFeedFilter = e.target.getAttribute('data-filter');
        loadFeed(currentFeedFilter);
    });
});

async function loadFeed(filterType) {
    if (!currentUserSession) return;
    
    feedList.innerHTML = '<div class="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><p>Yükleniyor...</p></div>';

    try {
        let query = supabase
            .from('gonderiler')
            .select(`
                *,
                yazar:uyeler (ad_soyad, avatar_url, rol),
                etkilesimler (id, user_id),
                gonderi_yorumlari (
                    id, metin, created_at, user_id, ust_yorum_id,
                    yazar:uyeler (ad_soyad, avatar_url, rol)
                )
            `)
            .order('created_at', { ascending: false });

        if (filterType !== 'all') query = query.eq('gonderi_tipi', filterType);

        const { data: posts, error } = await query;
        if (error) throw error;

        if (!posts || posts.length === 0) {
            feedList.innerHTML = `<div class="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200"><i class="fa-regular fa-folder-open text-3xl mb-2"></i><p>Buralar henüz çok sessiz. İlk paylaşımı sen yap!</p></div>`;
            return;
        }

        feedList.innerHTML = '';
        
        posts.forEach(post => {
            const author = post.yazar || {};
            const avatar = author.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.ad_soyad || 'U')}&background=1e3a8a&color=fff`;
            const dateStr = new Date(post.created_at).toLocaleDateString('tr-TR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });

            const likesCount = post.etkilesimler ? post.etkilesimler.length : 0;
            const isLikedByMe = post.etkilesimler ? post.etkilesimler.some(e => e.user_id === currentUserSession.user.id) : false;
            const likeIconClass = isLikedByMe ? "fa-solid fa-heart text-red-500" : "fa-regular fa-heart";
            const likeTextClass = isLikedByMe ? "text-red-500" : "text-slate-500";

            const allComments = post.gonderi_yorumlari || [];
            const topLevelComments = allComments.filter(c => !c.ust_yorum_id).sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
            const replies = allComments.filter(c => c.ust_yorum_id).sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
            const commentsCount = allComments.length;
            
            let commentsHTML = '';
            topLevelComments.forEach(comment => {
                const cAuthor = comment.yazar || {};
                const cAvatar = cAuthor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(cAuthor.ad_soyad || 'U')}&background=1e3a8a&color=fff`;
                
                commentsHTML += `
                    <div class="flex gap-2 items-start mt-4">
                        <img src="${cAvatar}" class="w-8 h-8 rounded-full object-cover border border-slate-200 mt-1">
                        <div class="flex-1">
                            <div class="bg-slate-100 px-3 py-2 rounded-xl inline-block">
                                <span class="font-bold text-[13px] text-slate-800 mr-2">${cAuthor.ad_soyad || 'Kullanıcı'}</span>
                                <span class="text-sm text-slate-700 whitespace-pre-wrap">${comment.metin}</span>
                            </div>
                            <div class="flex gap-4 mt-1 ml-2 text-[11px] text-slate-500 font-semibold">
                                <button class="hover:text-slate-800 reply-to-comment-btn" data-post-id="${post.id}" data-comment-id="${comment.id}" data-author-name="${cAuthor.ad_soyad}">Yanıtla</button>
                            </div>
                `;

                const commentReplies = replies.filter(r => r.ust_yorum_id === comment.id);
                commentReplies.forEach(reply => {
                    const rAuthor = reply.yazar || {};
                    const rAvatar = rAuthor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(rAuthor.ad_soyad || 'U')}&background=1e3a8a&color=fff`;
                    commentsHTML += `
                        <div class="flex gap-2 items-start mt-2 ml-4 border-l-2 border-slate-200 pl-2">
                            <img src="${rAvatar}" class="w-6 h-6 rounded-full object-cover border border-slate-200 mt-1">
                            <div>
                                <div class="bg-slate-100 px-3 py-2 rounded-xl inline-block">
                                    <span class="font-bold text-[12px] text-slate-800 mr-1">${rAuthor.ad_soyad || 'Kullanıcı'}</span>
                                    <span class="text-[13px] text-slate-700 whitespace-pre-wrap">${reply.metin}</span>
                                </div>
                            </div>
                        </div>
                    `;
                });

                commentsHTML += `</div></div>`; 
            });

            let mediaHTML = '';
            if (post.gonderi_tipi === 'medya' && post.medya_url) {
                if(post.medya_url.endsWith('.mp4')) {
                    mediaHTML = `<video controls class="w-full h-auto max-h-96 object-cover bg-black mt-3 rounded-xl"><source src="${post.medya_url}" type="video/mp4"></video>`;
                } else {
                    mediaHTML = `<img src="${post.medya_url}" class="w-full h-auto max-h-96 object-cover bg-slate-100 mt-3 rounded-xl border border-slate-100">`;
                }
            }

            // DİKKAT: Gönderinin ana kapsayıcısına id="post-${post.id}" ve transition özelliği eklendi
            const postHTML = `
                <div id="post-${post.id}" class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 transition-all duration-500">
                    <div class="flex items-center gap-3 mb-3">
                        <img src="${avatar}" class="w-11 h-11 rounded-full object-cover border border-slate-200">
                        <div>
                            <h4 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                                ${author.ad_soyad || 'Bilinmeyen Kullanıcı'}
                                <span class="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] uppercase tracking-wide border border-blue-100">${author.rol || 'Müşteri'}</span>
                            </h4>
                            <p class="text-[11px] text-slate-400">${dateStr}</p>
                        </div>
                    </div>
                    
                    <div class="text-slate-800 text-[15px] whitespace-pre-wrap">${post.metin}</div>
                    ${mediaHTML}
                    
                    <div class="flex items-center gap-6 mt-4 pt-3 border-t border-slate-100">
                        <button class="action-btn like-btn flex items-center gap-2 ${likeTextClass} hover:text-red-500 transition-colors text-sm font-semibold" data-post-id="${post.id}" data-author-id="${post.user_id}">
                            <i class="${likeIconClass} text-lg pointer-events-none"></i> <span class="pointer-events-none">${likesCount > 0 ? likesCount : 'Beğen'}</span>
                        </button>
                        <button class="action-btn comment-toggle-btn flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors text-sm font-semibold" data-post-id="${post.id}">
                            <i class="fa-regular fa-comment text-lg pointer-events-none"></i> <span class="pointer-events-none">${commentsCount > 0 ? commentsCount : 'Yorum Yap'}</span>
                        </button>
                    </div>

                    <div class="comment-section hidden mt-4 pt-4 border-t border-slate-100" id="comment-section-${post.id}">
                        <div class="mb-4 space-y-1">
                            ${commentsHTML}
                        </div>
                        
                        <div id="reply-indicator-${post.id}" class="hidden flex items-center justify-between bg-blue-50 text-blue-700 px-3 py-1.5 rounded-t-lg text-xs font-bold border border-blue-100 border-b-0">
                            <span><i class="fa-solid fa-reply mr-1"></i> <span id="reply-name-${post.id}"></span> kullanıcısına yanıt veriliyor</span>
                            <button class="cancel-reply-btn text-blue-500 hover:text-red-500" data-post-id="${post.id}"><i class="fa-solid fa-xmark"></i></button>
                        </div>

                        <div class="flex gap-2">
                            <input type="text" id="comment-input-${post.id}" class="flex-1 px-4 py-2 bg-slate-100 border border-slate-200 rounded-full focus:outline-none focus:border-blue-400 focus:bg-white text-sm transition-colors" placeholder="Yorum ekle...">
                            <button class="action-btn submit-comment-btn w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors shadow-sm" data-post-id="${post.id}" data-author-id="${post.user_id}">
                                <i class="fa-solid fa-paper-plane pointer-events-none text-sm"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            feedList.insertAdjacentHTML('beforeend', postHTML);
        });

    } catch (error) {
        console.error("Akış yükleme hatası:", error);
        feedList.innerHTML = `<div class="p-8 text-center text-red-500 bg-white rounded-xl border border-slate-200"><p>Gönderiler yüklenirken hata oluştu.</p></div>`;
    }
}

// ==========================================
// LIKE VE İÇ İÇE YORUM (EVENT DELEGATION)
// ==========================================
feedList.addEventListener('click', async (e) => {
    if (!currentUserSession) return;
    const target = e.target;

    if (target.classList.contains('like-btn')) {
        const postId = target.getAttribute('data-post-id');
        const authorId = target.getAttribute('data-author-id');
        try {
            const { data: existingLike } = await supabase.from('etkilesimler').select('id').eq('gonderi_id', postId).eq('user_id', currentUserSession.user.id).single();
            if (existingLike) {
                await supabase.from('etkilesimler').delete().eq('id', existingLike.id);
            } else {
                await supabase.from('etkilesimler').insert([{ gonderi_id: postId, user_id: currentUserSession.user.id, etkilesim_tipi: 'like' }]);
                if (authorId !== currentUserSession.user.id) {
                    await supabase.from('bildirimler').insert([{ alici_id: authorId, gonderen_id: currentUserSession.user.id, mesaj: 'Gönderini beğendi.', gonderi_id: postId }]);
                }
            }
            loadFeed(currentFeedFilter);
        } catch (err) {}
    }

    if (target.classList.contains('comment-toggle-btn')) {
        const postId = target.getAttribute('data-post-id');
        const commentSection = document.getElementById(`comment-section-${postId}`);
        commentSection.classList.toggle('hidden');
        if(!commentSection.classList.contains('hidden')) {
            document.getElementById(`comment-input-${postId}`).focus();
        }
    }

    if (target.classList.contains('reply-to-comment-btn')) {
        const postId = target.getAttribute('data-post-id');
        const commentId = target.getAttribute('data-comment-id');
        const authorName = target.getAttribute('data-author-name');
        
        activeReplyData[postId] = commentId;
        
        const indicator = document.getElementById(`reply-indicator-${postId}`);
        const nameSpan = document.getElementById(`reply-name-${postId}`);
        const inputEl = document.getElementById(`comment-input-${postId}`);
        
        indicator.classList.remove('hidden');
        indicator.classList.add('flex');
        nameSpan.innerText = authorName;
        inputEl.focus();
    }

    if (target.classList.contains('cancel-reply-btn') || target.closest('.cancel-reply-btn')) {
        const btn = target.classList.contains('cancel-reply-btn') ? target : target.closest('.cancel-reply-btn');
        const postId = btn.getAttribute('data-post-id');
        
        delete activeReplyData[postId];
        const indicator = document.getElementById(`reply-indicator-${postId}`);
        indicator.classList.add('hidden');
        indicator.classList.remove('flex');
    }

    if (target.classList.contains('submit-comment-btn')) {
        const postId = target.getAttribute('data-post-id');
        const authorId = target.getAttribute('data-author-id');
        const inputEl = document.getElementById(`comment-input-${postId}`);
        const commentText = inputEl.value.trim();

        if (!commentText) return;

        target.disabled = true;
        target.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        try {
            const ustYorumId = activeReplyData[postId] || null;

            await supabase.from('gonderi_yorumlari').insert([{
                gonderi_id: postId,
                user_id: currentUserSession.user.id,
                metin: commentText,
                ust_yorum_id: ustYorumId
            }]);

            if (authorId !== currentUserSession.user.id) {
                let bildirimMesaji = ustYorumId ? 'Yorumuna yanıt verdi: ' : 'Gönderine yorum yaptı: ';
                bildirimMesaji += commentText.substring(0, 20) + '...';
                
                await supabase.from('bildirimler').insert([{
                    alici_id: authorId,
                    gonderen_id: currentUserSession.user.id,
                    mesaj: bildirimMesaji,
                    gonderi_id: postId
                }]);
            }

            delete activeReplyData[postId];
            loadFeed(currentFeedFilter);
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Hata', text: 'Yorum gönderilemedi.' });
            target.disabled = false;
            target.innerHTML = '<i class="fa-solid fa-paper-plane text-xs"></i>';
        }
    }
});
