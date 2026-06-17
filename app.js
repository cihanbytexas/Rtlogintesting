import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

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
const editBioInput = document.getElementById('edit-bio');

const avatarInput = document.getElementById('reg-avatar');
const avatarPreview = document.getElementById('avatar-preview');

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

const likesModal = document.getElementById('likes-modal');
const closeLikesModalBtn = document.getElementById('close-likes-modal');
const likesList = document.getElementById('likes-list');

const userProfileModal = document.getElementById('user-profile-modal');
const closeUserProfileBtn = document.getElementById('close-user-profile');
const upHeaderName = document.getElementById('up-header-name');
const upAvatar = document.getElementById('up-avatar');
const upPostCount = document.getElementById('up-post-count');
const upFollowerCount = document.getElementById('up-follower-count');
const upFollowingCount = document.getElementById('up-following-count');
const upName = document.getElementById('up-name');
const upRole = document.getElementById('up-role');
const upBio = document.getElementById('up-bio');
const upGrid = document.getElementById('up-grid');
const followBtn = document.getElementById('follow-btn');
const unfollowBtn = document.getElementById('unfollow-btn');

const singlePostModal = document.getElementById('single-post-modal');
const closeSinglePostBtn = document.getElementById('close-single-post');
const singlePostContainer = document.getElementById('single-post-container');

let currentUserSession = null;
let currentFeedFilter = 'all';
let activeReplyData = {}; 
let selectedAvatarFile = null;
let selectedUpdateAvatarFile = null;
let currentlyViewingProfileId = null;

// --- YARDIMCI FONKSİYONLAR ---
function toggleAuthForms(activeForm) {
    [loginForm, registerForm, forgotPasswordForm, resetPasswordForm].forEach(f => f.classList.add('hidden'));
    activeForm.classList.remove('hidden');
}

// --- AUTH İŞLEMLERİ ---
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
            await supabase.from('uyeler').insert([{ id: authData.user.id, ad_soyad: name, rol: role, avatar_url: finalAvatarUrl, biyografi: "" }]);
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

forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    const btn = document.getElementById('forgot-btn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Gönderiliyor...';
    btn.disabled = true;
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        if (error) throw error;
        Swal.fire({ icon: 'success', title: 'Gönderildi', text: 'Sıfırlama bağlantısı iletildi.' });
        forgotPasswordForm.reset();
        toggleAuthForms(loginForm);
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Hata', text: error.message });
    } finally {
        btn.innerHTML = 'Gönder';
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
        btn.innerHTML = 'Güncelle';
        btn.disabled = false;
    }
});

// PROFİL DÜZENLEME
editProfileBtn.addEventListener('click', () => {
    dashboardView.classList.add('hidden');
    editProfileForm.classList.remove('hidden');
    editNameInput.value = document.getElementById('dash-name').innerText;
    editBioInput.value = document.getElementById('dash-bio').innerText;
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
    const newBio = editBioInput.value;
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
        
        const updateData = { ad_soyad: newName, biyografi: newBio };
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
        
        const { data: userData } = await supabase.from('uyeler').select('*').eq('id', session.user.id).single();
        if (userData) {
            document.getElementById('dash-name').innerText = userData.ad_soyad;
            document.getElementById('dash-role').innerText = userData.rol;
            document.getElementById('dash-email').innerText = session.user.email;
            document.getElementById('dash-bio').innerText = userData.biyografi || '';
            document.getElementById('dash-avatar').src = userData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.ad_soyad)}&background=1e3a8a&color=fff`;
            document.getElementById('dash-my-profile-trigger').setAttribute('data-user-id', session.user.id);
            document.getElementById('dash-name').setAttribute('data-user-id', session.user.id);
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

// --- BİLDİRİM SİSTEMİ ---
async function checkNotificationsBadge() {
    if (!currentUserSession) return;
    try {
        const { count } = await supabase.from('bildirimler').select('*', { count: 'exact', head: true }).eq('alici_id', currentUserSession.user.id).eq('okundu', false);
        if (count > 0) notificationBadge.classList.remove('hidden');
        else notificationBadge.classList.add('hidden');
    } catch (error) {}
}

notificationBtn.addEventListener('click', async () => {
    notificationModal.classList.remove('hidden');
    notificationList.innerHTML = '<div class="text-center text-slate-400 mt-10"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><p>Yükleniyor...</p></div>';
    try {
        const { data: notifications } = await supabase.from('bildirimler').select('*, gonderen:uyeler!gonderen_id(ad_soyad, avatar_url)').eq('alici_id', currentUserSession.user.id).order('created_at', { ascending: false }).limit(20);
        if (!notifications || notifications.length === 0) {
            notificationList.innerHTML = `<div class="text-center text-slate-500 mt-10"><i class="fa-regular fa-bell-slash text-3xl mb-2"></i><p>Bildirim yok.</p></div>`;
            return;
        }
        notificationList.innerHTML = '';
        notifications.forEach(notif => {
            const sender = notif.gonderen || {};
            const avatar = sender.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(sender.ad_soyad || 'U')}&background=1e3a8a&color=fff`;
            const isReadClass = notif.okundu ? 'bg-white' : 'bg-blue-50 border border-blue-100';
            const dotClass = notif.okundu ? 'hidden' : 'block';
            
            notificationList.insertAdjacentHTML('beforeend', `
                <div class="p-3 rounded-xl flex items-start gap-3 relative cursor-pointer hover:bg-slate-100 transition-colors ${isReadClass}" onclick="openSinglePostAndMarkRead(${notif.id}, ${notif.gonderi_id})">
                    <span class="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full ${dotClass}"></span>
                    <img src="${avatar}" class="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0">
                    <div class="flex-1 pr-4">
                        <p class="text-sm text-slate-800"><span class="font-bold">${sender.ad_soyad}</span> ${notif.mesaj}</p>
                        <p class="text-[10px] text-slate-400 mt-1">${new Date(notif.created_at).toLocaleDateString('tr-TR', { hour:'2-digit', minute:'2-digit' })}</p>
                    </div>
                </div>
            `);
        });
    } catch (error) {}
});

closeNotificationModalBtn.addEventListener('click', () => {
    notificationModal.classList.add('hidden');
    checkNotificationsBadge(); 
});

window.openSinglePostAndMarkRead = async (notificationId, postId) => {
    await supabase.from('bildirimler').update({ okundu: true }).eq('id', notificationId);
    notificationModal.classList.add('hidden');
    checkNotificationsBadge();
    openSinglePost(postId); // Ana sayfada kaydırmak yerine direkt tekil gönderiyi açıyoruz
};

// --- GÖNDERİ OLUŞTURMA ---
postTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if(e.target.value === 'medya') mediaUploadContainer.classList.remove('hidden');
        else { mediaUploadContainer.classList.add('hidden'); postMediaInput.value = ''; }
    });
});

openCreatePostBtn.addEventListener('click', () => createPostModal.classList.remove('hidden'));
closePostModalBtn.addEventListener('click', () => { createPostModal.classList.add('hidden'); createPostForm.reset(); mediaUploadContainer.classList.add('hidden'); });

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

        const { error: dbError } = await supabase.from('gonderiler').insert([{ user_id: currentUserSession.user.id, gonderi_tipi: postType, metin: text, medya_url: finalMediaUrl }]);
        if (dbError) throw dbError;

        createPostModal.classList.add('hidden');
        createPostForm.reset();
        mediaUploadContainer.classList.add('hidden');
        loadFeed(currentFeedFilter);
    } catch (error) { Swal.fire({ icon: 'error', title: 'Hata', text: error.message });
    } finally { submitPostBtn.innerHTML = 'Paylaş'; submitPostBtn.disabled = false; }
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

// HTML Şablonu Oluşturucu (Hem Ana Akış hem Tekil Gönderi İçin Ortak Fonksiyon)
function generatePostHTML(post, isSingleView = false) {
    const author = post.yazar || {};
    const avatar = author.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.ad_soyad || 'U')}&background=1e3a8a&color=fff`;
    const postDate = new Date(post.created_at);
    const dateStr = postDate.toLocaleDateString('tr-TR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });

    const likesCount = post.etkilesimler ? post.etkilesimler.length : 0;
    const isLikedByMe = post.etkilesimler ? post.etkilesimler.some(e => e.user_id === currentUserSession.user.id) : false;
    const likeIconClass = isLikedByMe ? "fa-solid fa-heart text-red-500" : "fa-regular fa-heart text-slate-500";
    const likeTextClass = isLikedByMe ? "text-red-500" : "text-slate-500";

    const postDiffMinutes = (new Date() - postDate) / (1000 * 60);
    const isPostOwner = currentUserSession.user.id === post.user_id;
    const canEditPost = isPostOwner && (postDiffMinutes <= 15);
    let postOptionsHTML = '';

    if (isPostOwner) {
        postOptionsHTML = `
            <div class="relative group ml-auto">
                <button class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-ellipsis-vertical pointer-events-none"></i></button>
                <div class="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 overflow-hidden">
                    ${canEditPost ? `<button class="edit-post-btn w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" data-post-id="${post.id}" data-text="${encodeURIComponent(post.metin)}"><i class="fa-solid fa-pen mr-2 text-blue-500 pointer-events-none"></i>Düzenle</button>` : ''}
                    <button class="delete-post-btn w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50" data-post-id="${post.id}"><i class="fa-solid fa-trash mr-2 pointer-events-none"></i>Sil</button>
                </div>
            </div>
        `;
    }

    const allComments = post.gonderi_yorumlari || [];
    const topLevelComments = allComments.filter(c => !c.ust_yorum_id).sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
    const replies = allComments.filter(c => c.ust_yorum_id).sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
    const commentsCount = allComments.length;
    
    let commentsHTML = '';
    topLevelComments.forEach(comment => {
        const cAuthor = comment.yazar || {};
        const cAvatar = cAuthor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(cAuthor.ad_soyad || 'U')}&background=1e3a8a&color=fff`;
        const cIsOwner = currentUserSession.user.id === comment.user_id;
        let cOptionsHTML = '';
        if (cIsOwner) cOptionsHTML = `${(new Date() - new Date(comment.created_at))/(1000*60) <= 15 ? `<button class="edit-comment-btn hover:text-blue-500 ml-2" data-comment-id="${comment.id}" data-text="${encodeURIComponent(comment.metin)}">Düzenle</button>` : ''}<button class="delete-comment-btn hover:text-red-500 ml-2" data-comment-id="${comment.id}">Sil</button>`;

        commentsHTML += `
            <div class="flex gap-2 items-start mt-4">
                <img src="${cAvatar}" class="w-8 h-8 rounded-full object-cover border border-slate-200 mt-1 cursor-pointer user-profile-trigger" data-user-id="${comment.user_id}">
                <div class="flex-1">
                    <div class="bg-slate-100 px-3 py-2 rounded-xl inline-block">
                        <span class="font-bold text-[13px] text-slate-800 mr-2 cursor-pointer hover:underline user-profile-trigger" data-user-id="${comment.user_id}">${cAuthor.ad_soyad || 'Kullanıcı'}</span>
                        <span class="text-sm text-slate-700 whitespace-pre-wrap">${comment.metin}</span>
                    </div>
                    <div class="flex items-center mt-1 ml-2 text-[11px] text-slate-500 font-semibold">
                        <button class="hover:text-slate-800 reply-to-comment-btn" data-post-id="${post.id}" data-comment-id="${comment.id}" data-author-name="${cAuthor.ad_soyad}">Yanıtla</button>
                        ${cOptionsHTML}
                    </div>
        `;

        replies.filter(r => r.ust_yorum_id === comment.id).forEach(reply => {
            const rAuthor = reply.yazar || {};
            const rAvatar = rAuthor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(rAuthor.ad_soyad || 'U')}&background=1e3a8a&color=fff`;
            const rIsOwner = currentUserSession.user.id === reply.user_id;
            let rOptionsHTML = '';
            if (rIsOwner) rOptionsHTML = `${(new Date() - new Date(reply.created_at))/(1000*60) <= 15 ? `<button class="edit-comment-btn hover:text-blue-500 ml-2" data-comment-id="${reply.id}" data-text="${encodeURIComponent(reply.metin)}">Düzenle</button>` : ''}<button class="delete-comment-btn hover:text-red-500 ml-2" data-comment-id="${reply.id}">Sil</button>`;

            commentsHTML += `
                <div class="flex gap-2 items-start mt-2 ml-4 border-l-2 border-slate-200 pl-2">
                    <img src="${rAvatar}" class="w-6 h-6 rounded-full object-cover border border-slate-200 mt-1 cursor-pointer user-profile-trigger" data-user-id="${reply.user_id}">
                    <div>
                        <div class="bg-slate-100 px-3 py-2 rounded-xl inline-block">
                            <span class="font-bold text-[12px] text-slate-800 mr-1 cursor-pointer hover:underline user-profile-trigger" data-user-id="${reply.user_id}">${rAuthor.ad_soyad || 'Kullanıcı'}</span>
                            <span class="text-[13px] text-slate-700 whitespace-pre-wrap">${reply.metin}</span>
                        </div>
                        <div class="flex items-center mt-1 ml-2 text-[10px] text-slate-500 font-semibold">${rOptionsHTML}</div>
                    </div>
                </div>
            `;
        });
        commentsHTML += `</div></div>`; 
    });

    let mediaHTML = '';
    if (post.gonderi_tipi === 'medya' && post.medya_url) {
        if(post.medya_url.endsWith('.mp4')) mediaHTML = `<video controls class="w-full h-auto max-h-96 object-cover bg-black mt-3 rounded-xl pointer-events-auto"><source src="${post.medya_url}" type="video/mp4"></video>`;
        else mediaHTML = `<img src="${post.medya_url}" class="w-full h-auto max-h-96 object-cover bg-slate-100 mt-3 rounded-xl border border-slate-100 pointer-events-auto">`;
    }

    return `
        <div id="post-${post.id}" class="post-card no-select bg-white p-5 rounded-2xl shadow-sm border border-slate-200 transition-all duration-500" data-post-id="${post.id}">
            <div class="flex justify-between items-start mb-3 pointer-events-auto">
                <div class="flex items-center gap-3">
                    <img src="${avatar}" class="w-11 h-11 rounded-full object-cover border border-slate-200 cursor-pointer user-profile-trigger" data-user-id="${post.user_id}">
                    <div>
                        <h4 class="font-bold text-slate-800 text-sm flex items-center gap-2 cursor-pointer hover:underline user-profile-trigger" data-user-id="${post.user_id}">
                            ${author.ad_soyad || 'Bilinmeyen'}
                            <span class="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] uppercase tracking-wide border border-blue-100">${author.rol || 'Müşteri'}</span>
                        </h4>
                        <p class="text-[11px] text-slate-400">${dateStr}</p>
                    </div>
                </div>
                ${postOptionsHTML}
            </div>
            
            <div class="text-slate-800 text-[15px] whitespace-pre-wrap pointer-events-auto">${post.metin}</div>
            ${mediaHTML}
            
            <div class="flex items-center gap-6 mt-4 pt-3 border-t border-slate-100 pointer-events-auto">
                <button class="action-btn like-btn flex items-center gap-2 ${likeTextClass} hover:text-red-500 transition-colors text-sm font-semibold pointer-events-auto" data-post-id="${post.id}" data-author-id="${post.user_id}">
                    <i class="${likeIconClass} pointer-events-none" id="like-icon-${post.id}"></i> <span class="pointer-events-none" id="like-count-${post.id}">${likesCount > 0 ? likesCount : 'Beğen'}</span>
                </button>
                <button class="action-btn comment-toggle-btn flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors text-sm font-semibold pointer-events-auto" data-post-id="${post.id}">
                    <i class="fa-regular fa-comment text-lg pointer-events-none"></i> <span class="pointer-events-none">${commentsCount > 0 ? commentsCount : 'Yorum Yap'}</span>
                </button>
            </div>

            <div class="comment-section ${isSingleView ? '' : 'hidden'} mt-4 pt-4 border-t border-slate-100 pointer-events-auto" id="comment-section-${post.id}">
                <div class="mb-4 space-y-1" id="comment-list-${post.id}">${commentsHTML}</div>
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
}

async function loadFeed(filterType) {
    if (!currentUserSession) return;
    feedList.innerHTML = '<div class="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><p>Yükleniyor...</p></div>';

    try {
        let query = supabase.from('gonderiler').select(`*, yazar:uyeler(ad_soyad, avatar_url, rol), etkilesimler(id, user_id), gonderi_yorumlari(id, metin, created_at, user_id, ust_yorum_id, yazar:uyeler(ad_soyad, avatar_url, rol))`).order('created_at', { ascending: false });
        if (filterType !== 'all') query = query.eq('gonderi_tipi', filterType);
        
        const { data: posts, error } = await query;
        if (error) throw error;

        if (!posts || posts.length === 0) {
            feedList.innerHTML = `<div class="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200"><i class="fa-regular fa-folder-open text-3xl mb-2"></i><p>Buralar henüz çok sessiz.</p></div>`;
            return;
        }

        feedList.innerHTML = '';
        posts.forEach(post => {
            feedList.insertAdjacentHTML('beforeend', generatePostHTML(post, false));
        });

    } catch (error) {
        feedList.innerHTML = `<div class="p-8 text-center text-red-500 bg-white rounded-xl border border-slate-200"><p>Gönderiler yüklenirken hata oluştu.</p></div>`;
    }
}

// ==========================================
// OPTIMISTIC UI: LIKE & YORUM & AKSİYONLAR
// ==========================================

// GLOBAL EVENT LISTENER (Hem feed-list hem single-post-container için)
document.addEventListener('click', async (e) => {
    if (!currentUserSession) return;
    const target = e.target;

    // 1. ANINDA BEĞENME (OPTIMISTIC UI - Yüklenme ekranı kalktı)
    if (target.classList.contains('like-btn')) {
        const postId = target.getAttribute('data-post-id');
        const authorId = target.getAttribute('data-author-id');
        
        const icon = document.getElementById(`like-icon-${postId}`);
        const countSpan = document.getElementById(`like-count-${postId}`);
        const isCurrentlyLiked = icon.classList.contains('fa-solid');
        let currentCount = parseInt(countSpan.innerText) || 0;

        // Anında Arayüzü Değiştir
        if (isCurrentlyLiked) {
            icon.className = "fa-regular fa-heart text-lg text-slate-500 pointer-events-none";
            target.classList.replace('text-red-500', 'text-slate-500');
            currentCount = currentCount > 1 ? currentCount - 1 : 'Beğen';
        } else {
            icon.className = "fa-solid fa-heart text-lg text-red-500 pointer-events-none";
            target.classList.replace('text-slate-500', 'text-red-500');
            currentCount = currentCount === 'Beğen' ? 1 : currentCount + 1;
        }
        countSpan.innerText = currentCount;

        // Arka Planda Veritabanını Güncelle
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
        } catch (err) { console.error("Beğeni DB hatası", err); } // Kullanıcı hissetmez
    }

    // 2. YORUM GÖNDERME (Optimistic UI - Sadece Yorum Alanı Yenilenir)
    if (target.classList.contains('submit-comment-btn')) {
        const postId = target.getAttribute('data-post-id');
        const authorId = target.getAttribute('data-author-id');
        const inputEl = document.getElementById(`comment-input-${postId}`);
        const commentText = inputEl.value.trim();
        if (!commentText) return;

        target.disabled = true; target.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        try {
            const ustYorumId = activeReplyData[postId] || null;
            await supabase.from('gonderi_yorumlari').insert([{ gonderi_id: postId, user_id: currentUserSession.user.id, metin: commentText, ust_yorum_id: ustYorumId }]);
            if (authorId !== currentUserSession.user.id) {
                let bildirimMesaji = ustYorumId ? 'Yorumuna yanıt verdi: ' : 'Gönderine yorum yaptı: ';
                await supabase.from('bildirimler').insert([{ alici_id: authorId, gonderen_id: currentUserSession.user.id, mesaj: bildirimMesaji + commentText.substring(0, 20) + '...', gonderi_id: postId }]);
            }
            delete activeReplyData[postId];
            inputEl.value = '';
            
            // Tüm sayfayı yenilemek yerine sadece o postun verisini çekip listeyi güncelliyoruz
            const { data: post } = await supabase.from('gonderiler').select(`*, yazar:uyeler(ad_soyad, avatar_url, rol), etkilesimler(id, user_id), gonderi_yorumlari(id, metin, created_at, user_id, ust_yorum_id, yazar:uyeler(ad_soyad, avatar_url, rol))`).eq('id', postId).single();
            const newHTML = generatePostHTML(post, true); // true = Yorum kısmı açık kalsın
            document.getElementById(`post-${postId}`).outerHTML = newHTML;

        } catch (err) {} finally { target.disabled = false; target.innerHTML = '<i class="fa-solid fa-paper-plane text-sm"></i>'; }
    }

    // Diğer Butonlar
    if (target.classList.contains('comment-toggle-btn')) {
        const postId = target.getAttribute('data-post-id');
        const commentSection = document.getElementById(`comment-section-${postId}`);
        commentSection.classList.toggle('hidden');
        if(!commentSection.classList.contains('hidden')) document.getElementById(`comment-input-${postId}`).focus();
    }

    if (target.classList.contains('reply-to-comment-btn')) {
        const postId = target.getAttribute('data-post-id');
        activeReplyData[postId] = target.getAttribute('data-comment-id');
        document.getElementById(`reply-indicator-${postId}`).classList.replace('hidden', 'flex');
        document.getElementById(`reply-name-${postId}`).innerText = target.getAttribute('data-author-name');
        document.getElementById(`comment-input-${postId}`).focus();
    }

    if (target.classList.contains('cancel-reply-btn') || target.closest('.cancel-reply-btn')) {
        const btn = target.classList.contains('cancel-reply-btn') ? target : target.closest('.cancel-reply-btn');
        const postId = btn.getAttribute('data-post-id');
        delete activeReplyData[postId];
        document.getElementById(`reply-indicator-${postId}`).classList.replace('flex', 'hidden');
    }

    // GÖNDERİ/YORUM SİL VE DÜZENLE (Silme sonrası sayfayı mecburen yenileriz)
    if (target.classList.contains('delete-post-btn')) {
        const postId = target.getAttribute('data-post-id');
        Swal.fire({ title: 'Sil?', text: "Gönderiyi siliyorum!", icon: 'warning', showCancelButton: true, confirmButtonText: 'Evet' }).then(async (res) => { if (res.isConfirmed) { await supabase.from('gonderiler').delete().eq('id', postId); loadFeed(currentFeedFilter); closeSinglePostBtn.click(); } });
    }
    if (target.classList.contains('edit-post-btn')) {
        const postId = target.getAttribute('data-post-id');
        const oldText = decodeURIComponent(target.getAttribute('data-text'));
        const { value: newText } = await Swal.fire({ input: 'textarea', inputValue: oldText, showCancelButton: true, confirmButtonText: 'Kaydet' });
        if (newText && newText !== oldText) { await supabase.from('gonderiler').update({ metin: newText }).eq('id', postId); loadFeed(currentFeedFilter); closeSinglePostBtn.click(); }
    }
    if (target.classList.contains('delete-comment-btn')) {
        const commentId = target.getAttribute('data-comment-id');
        Swal.fire({ title: 'Sil?', icon: 'question', showCancelButton: true, confirmButtonText: 'Evet' }).then(async (res) => { if (res.isConfirmed) { await supabase.from('gonderi_yorumlari').delete().eq('id', commentId); loadFeed(currentFeedFilter); } });
    }
    if (target.classList.contains('edit-comment-btn')) {
        const commentId = target.getAttribute('data-comment-id');
        const oldText = decodeURIComponent(target.getAttribute('data-text'));
        const { value: newText } = await Swal.fire({ input: 'text', inputValue: oldText, showCancelButton: true, confirmButtonText: 'Kaydet' });
        if (newText && newText !== oldText) { await supabase.from('gonderi_yorumlari').update({ metin: newText }).eq('id', commentId); loadFeed(currentFeedFilter); }
    }
});

// ==========================================
// UZUN BASMA (LONG PRESS) - BEĞENENLER
// ==========================================
let pressTimer;
function startPress(e) {
    const postCard = e.target.closest('.post-card');
    if (postCard && !e.target.closest('button') && !e.target.closest('input')) {
        const postId = postCard.getAttribute('data-post-id');
        pressTimer = window.setTimeout(() => showLikesModal(postId), 700);
    }
}
function cancelPress() { clearTimeout(pressTimer); }

['mousedown', 'touchstart'].forEach(evt => document.addEventListener(evt, startPress));
['mouseup', 'mouseleave', 'touchend', 'touchmove'].forEach(evt => document.addEventListener(evt, cancelPress));
document.addEventListener('contextmenu', (e) => { if(e.target.closest('.post-card')) e.preventDefault(); });

async function showLikesModal(postId) {
    if (!postId) return;
    likesModal.classList.remove('hidden');
    likesList.innerHTML = '<div class="text-center text-slate-400 mt-4"><i class="fa-solid fa-spinner fa-spin text-xl mb-2"></i><p>Yükleniyor...</p></div>';
    try {
        const { data, error } = await supabase.from('etkilesimler').select('user_id, uyeler(ad_soyad, avatar_url, rol)').eq('gonderi_id', postId).eq('etkilesim_tipi', 'like');
        if (!data || data.length === 0) { likesList.innerHTML = '<div class="text-center text-slate-500 mt-4 text-sm">Henüz beğenen yok.</div>'; return; }
        likesList.innerHTML = '';
        data.forEach(like => {
            const user = like.uyeler || {};
            const avatar = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.ad_soyad || 'U')}&background=1e3a8a&color=fff`;
            likesList.insertAdjacentHTML('beforeend', `
                <div class="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg user-profile-trigger" data-user-id="${like.user_id}" onclick="document.getElementById('close-likes-modal').click();">
                    <img src="${avatar}" class="w-10 h-10 rounded-full object-cover border border-slate-200 pointer-events-none">
                    <div class="pointer-events-none">
                        <div class="font-bold text-sm text-slate-800">${user.ad_soyad}</div>
                        <div class="text-[10px] text-slate-500">${user.rol}</div>
                    </div>
                </div>
            `);
        });
    } catch (err) {}
}
closeLikesModalBtn.addEventListener('click', () => likesModal.classList.add('hidden'));

// ==========================================
// INSTAGRAM PROFİL GÖRÜNÜMÜ & TAKİP SİSTEMİ
// ==========================================
document.addEventListener('click', async (e) => {
    const trigger = e.target.closest('.user-profile-trigger');
    if (trigger) {
        clearTimeout(pressTimer);
        const targetUserId = trigger.getAttribute('data-user-id');
        if (!targetUserId) return;
        
        currentlyViewingProfileId = targetUserId;
        userProfileModal.classList.remove('hidden');
        setTimeout(() => userProfileModal.classList.remove('translate-x-full'), 10);
        
        upHeaderName.innerText = "Yükleniyor..."; upName.innerText = "Yükleniyor..."; upBio.innerText = "";
        upGrid.innerHTML = '<div class="col-span-3 text-center p-10"><i class="fa-solid fa-spinner fa-spin text-2xl text-slate-400"></i></div>';
        
        // Takip Butonu Durumu
        if (targetUserId === currentUserSession.user.id) {
            followBtn.classList.add('hidden'); unfollowBtn.classList.add('hidden');
        } else {
            const { data: isFollowing } = await supabase.from('takipler').select('id').eq('takip_eden_id', currentUserSession.user.id).eq('takip_edilen_id', targetUserId).single();
            if (isFollowing) { followBtn.classList.add('hidden'); unfollowBtn.classList.remove('hidden'); } 
            else { unfollowBtn.classList.add('hidden'); followBtn.classList.remove('hidden'); }
        }

        try {
            const { data: user } = await supabase.from('uyeler').select('*').eq('id', targetUserId).single();
            upHeaderName.innerText = user.ad_soyad; upName.innerText = user.ad_soyad; upRole.innerText = user.rol; upBio.innerText = user.biyografi || '';
            upAvatar.src = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.ad_soyad)}&background=1e3a8a&color=fff`;

            // Takipçi Sayıları
            const { count: followers } = await supabase.from('takipler').select('*', { count: 'exact', head: true }).eq('takip_edilen_id', targetUserId);
            const { count: following } = await supabase.from('takipler').select('*', { count: 'exact', head: true }).eq('takip_eden_id', targetUserId);
            upFollowerCount.innerText = followers || 0; upFollowingCount.innerText = following || 0;

            const { data: posts } = await supabase.from('gonderiler').select('*').eq('user_id', targetUserId).order('created_at', { ascending: false });
            upPostCount.innerText = posts ? posts.length : 0;
            upGrid.innerHTML = '';

            if (posts && posts.length > 0) {
                posts.forEach(post => {
                    let contentHTML = '';
                    if (post.gonderi_tipi === 'medya' && post.medya_url) {
                        if(post.medya_url.endsWith('.mp4')) contentHTML = `<div class="absolute inset-0 bg-black flex items-center justify-center"><i class="fa-solid fa-play text-white text-2xl opacity-70"></i></div>`;
                        else contentHTML = `<img src="${post.medya_url}" class="w-full h-full object-cover">`;
                    } else contentHTML = `<div class="w-full h-full bg-slate-200 p-2 flex items-center justify-center text-center"><p class="text-[10px] text-slate-600 line-clamp-4 font-semibold">${post.metin}</p></div>`;

                    upGrid.insertAdjacentHTML('beforeend', `
                        <div class="aspect-square relative border-r border-b border-white cursor-pointer hover:opacity-80 transition-opacity" onclick="openSinglePost(${post.id})">
                            ${contentHTML}
                        </div>
                    `);
                });
            } else upGrid.innerHTML = '<div class="col-span-3 text-center p-10 text-slate-400 text-sm">Gönderi Yok</div>';
        } catch (err) {}
    }
});

closeUserProfileBtn.addEventListener('click', () => {
    userProfileModal.classList.add('translate-x-full');
    setTimeout(() => userProfileModal.classList.add('hidden'), 300);
});

// Takip Etme / Çıkma İşlemleri
followBtn.addEventListener('click', async () => {
    followBtn.disabled = true; followBtn.innerHTML = '...';
    try {
        await supabase.from('takipler').insert([{ takip_eden_id: currentUserSession.user.id, takip_edilen_id: currentlyViewingProfileId }]);
        await supabase.from('bildirimler').insert([{ alici_id: currentlyViewingProfileId, gonderen_id: currentUserSession.user.id, mesaj: 'Seni takip etmeye başladı.' }]);
        followBtn.classList.add('hidden'); unfollowBtn.classList.remove('hidden');
        upFollowerCount.innerText = parseInt(upFollowerCount.innerText) + 1;
    } catch(err) {} finally { followBtn.disabled = false; followBtn.innerHTML = 'Takip Et'; }
});

unfollowBtn.addEventListener('click', async () => {
    unfollowBtn.disabled = true; unfollowBtn.innerHTML = '...';
    try {
        await supabase.from('takipler').delete().eq('takip_eden_id', currentUserSession.user.id).eq('takip_edilen_id', currentlyViewingProfileId);
        unfollowBtn.classList.add('hidden'); followBtn.classList.remove('hidden');
        upFollowerCount.innerText = parseInt(upFollowerCount.innerText) - 1;
    } catch(err) {} finally { unfollowBtn.disabled = false; unfollowBtn.innerHTML = 'Takipten Çık'; }
});

// ==========================================
// TEKİL GÖNDERİ MODALI (INSTAGRAM GİBİ AÇILIR)
// ==========================================
window.openSinglePost = async (postId) => {
    singlePostModal.classList.remove('hidden');
    setTimeout(() => singlePostModal.classList.remove('translate-x-full'), 10);
    singlePostContainer.innerHTML = '<div class="text-center text-slate-400 mt-20"><i class="fa-solid fa-spinner fa-spin text-3xl mb-2"></i></div>';

    try {
        const { data: post, error } = await supabase.from('gonderiler').select(`*, yazar:uyeler(ad_soyad, avatar_url, rol), etkilesimler(id, user_id), gonderi_yorumlari(id, metin, created_at, user_id, ust_yorum_id, yazar:uyeler(ad_soyad, avatar_url, rol))`).eq('id', postId).single();
        if (error) throw error;
        singlePostContainer.innerHTML = generatePostHTML(post, true); // true = Yorumları açık getir
    } catch (error) {
        singlePostContainer.innerHTML = '<div class="text-center text-red-500 mt-20">Gönderi bulunamadı.</div>';
    }
};

closeSinglePostBtn.addEventListener('click', () => {
    singlePostModal.classList.add('translate-x-full');
    setTimeout(() => singlePostModal.classList.add('hidden'), 300);
});
