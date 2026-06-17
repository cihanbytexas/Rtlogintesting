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

const messagesBtn = document.getElementById('messages-btn');
const messagesBadge = document.getElementById('messages-badge');
const messagesListModal = document.getElementById('messages-list-modal');
const closeMessagesListModalBtn = document.getElementById('close-messages-list-modal');
const conversationsList = document.getElementById('conversations-list');
const chatModal = document.getElementById('chat-modal');
const closeChatBtn = document.getElementById('close-chat-btn');
const chatHistory = document.getElementById('chat-history');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMediaInput = document.getElementById('chat-media-input');
const chatTypingIndicator = document.getElementById('chat-typing-indicator');
const chatUserAvatar = document.getElementById('chat-user-avatar');
const chatUserName = document.getElementById('chat-user-name');
const messageUserBtn = document.getElementById('message-user-btn');

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

const tabGrid = document.getElementById('tab-grid');
const tabQuestions = document.getElementById('tab-questions');
const upQuestionsList = document.getElementById('up-questions-list');

const singlePostModal = document.getElementById('single-post-modal');
const closeSinglePostBtn = document.getElementById('close-single-post');
const singlePostContainer = document.getElementById('single-post-container');

let currentUserSession = null;
let currentFeedFilter = 'all';
let activeReplyData = {}; 
let selectedAvatarFile = null;
let selectedUpdateAvatarFile = null;
let currentlyViewingProfileId = null;
let currentChatUserId = null; 
let realtimeChannel = null;
let chatBroadcastChannel = null;
let typingTimeout;

// --- UTILS ---
function toggleAuthForms(activeForm) {
    [loginForm, registerForm, forgotPasswordForm, resetPasswordForm].forEach(f => f.classList.add('hidden'));
    activeForm.classList.remove('hidden');
}

avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        selectedAvatarFile = file;
        const reader = new FileReader();
        reader.onload = (e) => avatarPreview.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
        reader.readAsDataURL(file);
    }
});

// --- AUTH ---
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
    } catch (error) { Swal.fire({ icon: 'error', title: 'Hata', text: error.message }); }
    finally { btn.innerHTML = 'Kayıt Ol'; btn.disabled = false; }
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
    } catch (error) { Swal.fire({ icon: 'error', title: 'Başarısız', text: "E-posta veya şifre hatalı!" }); }
    finally { btn.innerHTML = 'Giriş Yap'; btn.disabled = false; }
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
        Swal.fire({ icon: 'success', title: 'Gönderildi', text: 'Bağlantı iletildi.' });
        forgotPasswordForm.reset();
        toggleAuthForms(loginForm);
    } catch (error) { Swal.fire({ icon: 'error', title: 'Hata', text: error.message }); }
    finally { btn.innerHTML = 'Gönder'; btn.disabled = false; }
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
        Swal.fire({ icon: 'success', title: 'Başarılı', text: 'Şifre güncellendi!', timer: 1500, showConfirmButton: false });
        resetPasswordForm.reset();
        checkSession();
    } catch (error) { Swal.fire({ icon: 'error', title: 'Hata', text: error.message }); }
    finally { btn.innerHTML = 'Güncelle'; btn.disabled = false; }
});

editProfileBtn.addEventListener('click', () => {
    dashboardView.classList.add('hidden'); editProfileForm.classList.remove('hidden');
    editNameInput.value = document.getElementById('dash-name').innerText;
    editBioInput.value = document.getElementById('dash-bio').innerText;
    editAvatarImg.src = document.getElementById('dash-avatar').src;
    selectedUpdateAvatarFile = null;
});

cancelEditBtn.addEventListener('click', () => { editProfileForm.classList.add('hidden'); dashboardView.classList.remove('hidden'); });

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
    const btn = document.getElementById('save-edit-btn');
    btn.innerHTML = 'Kaydediliyor...'; btn.disabled = true;
    try {
        let updatedAvatarUrl = null;
        if (selectedUpdateAvatarFile) {
            const ext = selectedUpdateAvatarFile.name.split('.').pop();
            const fileName = `${currentUserSession.user.id}-${Math.random()}.${ext}`;
            await supabase.storage.from('avatars').upload(fileName, selectedUpdateAvatarFile);
            updatedAvatarUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl;
        }
        const updateData = { ad_soyad: editNameInput.value, biyografi: editBioInput.value };
        if (updatedAvatarUrl) updateData.avatar_url = updatedAvatarUrl;
        await supabase.from('uyeler').update(updateData).eq('id', currentUserSession.user.id);
        
        editProfileForm.classList.add('hidden'); dashboardView.classList.remove('hidden');
        checkSession();
    } catch (error) { Swal.fire({ icon: 'error', title: 'Hata', text: error.message }); }
    finally { btn.innerHTML = 'Kaydet'; btn.disabled = false; }
});

logoutBtn.addEventListener('click', async () => {
    if (realtimeChannel) supabase.removeChannel(realtimeChannel);
    if (chatBroadcastChannel) supabase.removeChannel(chatBroadcastChannel);
    await supabase.auth.signOut();
    mainAppContainer.classList.add('hidden'); authContainer.classList.remove('hidden');
});

// --- CANLI YAYIN (REALTIME) VE YAZIYOR... SİSTEMİ ---
function setupRealtime() {
    if (realtimeChannel) return;
    realtimeChannel = supabase.channel('oz-yapi-realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gonderiler' }, async (payload) => {
            if (payload.new.user_id !== currentUserSession?.user?.id) {
                const { data: newPost } = await supabase.from('gonderiler').select(`*, yazar:uyeler(ad_soyad, avatar_url, rol), etkilesimler(id, user_id), gonderi_yorumlari(id, metin, created_at, user_id, ust_yorum_id, yazar:uyeler(ad_soyad, avatar_url, rol))`).eq('id', payload.new.id).single();
                if (newPost && (currentFeedFilter === 'all' || currentFeedFilter === newPost.gonderi_tipi)) {
                    const emptyIcon = feedList.querySelector('.fa-folder-open');
                    if (emptyIcon) feedList.innerHTML = '';
                    feedList.insertAdjacentHTML('afterbegin', generatePostHTML(newPost, false));
                }
            }
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bildirimler' }, (payload) => {
            if (payload.new.alici_id === currentUserSession?.user?.id) notificationBadge.classList.remove('hidden');
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'mesajlar' }, (payload) => {
            const isRelatedToMe = payload.new?.alici_id === currentUserSession?.user?.id || payload.new?.gonderen_id === currentUserSession?.user?.id || payload.old?.gonderen_id === currentUserSession?.user?.id;
            
            if (isRelatedToMe) {
                if (payload.eventType === 'INSERT') {
                    if (currentChatUserId === payload.new.gonderen_id || currentChatUserId === payload.new.alici_id) {
                        const isMine = payload.new.gonderen_id === currentUserSession.user.id;
                        appendMessageToUI(payload.new, isMine);
                        if (!isMine) supabase.from('mesajlar').update({okundu: true}).eq('id', payload.new.id).then(()=>{}); 
                    } else if (payload.new.alici_id === currentUserSession.user.id) {
                        checkMessagesBadge();
                        if (!messagesListModal.classList.contains('hidden')) loadConversations();
                    }
                } 
                else if (payload.eventType === 'UPDATE') {
                    const bubbleWrapper = document.getElementById(`msg-wrapper-${payload.new.id}`);
                    if (bubbleWrapper) {
                        const bubble = bubbleWrapper.querySelector('.msg-bubble');
                        const heart = bubbleWrapper.querySelector('.msg-heart');
                        
                        bubble.setAttribute('data-is-liked', payload.new.begendi.toString());
                        if (payload.new.begendi) {
                            heart.classList.remove('scale-0', 'opacity-0');
                            heart.classList.add('scale-100', 'opacity-100');
                        } else {
                            heart.classList.remove('scale-100', 'opacity-100');
                            heart.classList.add('scale-0', 'opacity-0');
                        }

                        const readIcon = bubbleWrapper.querySelector('.msg-read-status');
                        if (readIcon && payload.new.okundu) readIcon.className = 'msg-read-status fa-solid fa-check-double text-blue-500 ml-1';
                    }
                    if (!messagesListModal.classList.contains('hidden')) loadConversations();
                } 
                else if (payload.eventType === 'DELETE') {
                    const wrapper = document.getElementById(`msg-wrapper-${payload.old.id}`);
                    if(wrapper) wrapper.remove();
                    if (!messagesListModal.classList.contains('hidden')) loadConversations();
                }
            }
        })
        .subscribe();

    if(!chatBroadcastChannel) {
        chatBroadcastChannel = supabase.channel('chat-typing');
        chatBroadcastChannel.on('broadcast', { event: 'typing' }, payload => {
            if (payload.payload.to === currentUserSession.user.id && payload.payload.from === currentChatUserId && !chatModal.classList.contains('hidden')) {
                chatTypingIndicator.classList.remove('hidden');
                chatTypingIndicator.classList.add('flex');
                scrollToChatBottom();
                clearTimeout(typingTimeout);
                typingTimeout = setTimeout(() => {
                    chatTypingIndicator.classList.remove('flex');
                    chatTypingIndicator.classList.add('hidden');
                }, 2000);
            }
        }).subscribe();
    }
}

async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        currentUserSession = session;
        authContainer.classList.add('hidden'); mainAppContainer.classList.remove('hidden');
        document.getElementById('dash-email').innerText = session.user.email;

        try {
            const { data: userData } = await supabase.from('uyeler').select('*').eq('id', session.user.id).single();
            if (userData) {
                document.getElementById('dash-name').innerText = userData.ad_soyad || 'İsimsiz';
                document.getElementById('dash-role').innerText = userData.rol || 'KULLANICI';
                document.getElementById('dash-bio').innerText = userData.biyografi || '';
                document.getElementById('dash-avatar').src = userData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.ad_soyad || 'U')}&background=1e3a8a&color=fff`;
                document.getElementById('dash-my-profile-trigger').setAttribute('data-user-id', session.user.id);
                document.getElementById('dash-name').setAttribute('data-user-id', session.user.id);
            }
        } catch (e) {}
        
        loadFeed(currentFeedFilter);
        checkNotificationsBadge();
        checkMessagesBadge();
        setupRealtime();
    } else {
        currentUserSession = null;
        if (realtimeChannel) { supabase.removeChannel(realtimeChannel); realtimeChannel = null; }
        if (chatBroadcastChannel) { supabase.removeChannel(chatBroadcastChannel); chatBroadcastChannel = null; }
        mainAppContainer.classList.add('hidden'); authContainer.classList.remove('hidden');
        toggleAuthForms(loginForm);
    }
}

document.addEventListener('DOMContentLoaded', checkSession);

// --- BİLDİRİMLER ---
async function checkNotificationsBadge() {
    if (!currentUserSession) return;
    try {
        const { count } = await supabase.from('bildirimler').select('*', { count: 'exact', head: true }).eq('alici_id', currentUserSession.user.id).eq('okundu', false);
        if (count > 0) notificationBadge.classList.remove('hidden'); else notificationBadge.classList.add('hidden');
    } catch (error) {}
}

notificationBtn.addEventListener('click', async () => {
    notificationModal.classList.remove('hidden');
    notificationList.innerHTML = '<div class="text-center text-slate-400 mt-10"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i></div>';
    try {
        const { data: notifications } = await supabase.from('bildirimler').select('*, gonderen:uyeler!gonderen_id(ad_soyad, avatar_url)').eq('alici_id', currentUserSession.user.id).order('created_at', { ascending: false }).limit(20);
        if (!notifications || notifications.length === 0) { notificationList.innerHTML = '<p class="text-center mt-10 text-slate-500">Bildirim yok.</p>'; return; }
        notificationList.innerHTML = '';
        notifications.forEach(notif => {
            const sender = notif.gonderen || {};
            const avatar = sender.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(sender.ad_soyad || 'U')}`;
            const isReadClass = notif.okundu ? 'bg-white' : 'bg-blue-50 border border-blue-100';
            const dotClass = notif.okundu ? 'hidden' : 'block';
            const postIdParam = notif.gonderi_id ? `'${notif.gonderi_id}'` : 'null';
            const senderIdParam = notif.gonderen_id ? `'${notif.gonderen_id}'` : 'null';

            notificationList.insertAdjacentHTML('beforeend', `
                <div class="p-3 rounded-xl flex items-start gap-3 relative cursor-pointer hover:bg-slate-100 bg-white border border-slate-100 ${notif.okundu ? '' : 'bg-blue-50/60'}" onclick="handleNotificationClick(${notif.id}, ${postIdParam}, ${senderIdParam})">
                    <span class="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full ${dotClass}"></span>
                    <img src="${avatar}" class="w-10 h-10 rounded-full object-cover flex-shrink-0">
                    <div class="flex-1 text-sm text-slate-800"><span class="font-bold">${sender.ad_soyad}</span> ${notif.mesaj}</div>
                </div>
            `);
        });
    } catch (error) {}
});

closeNotificationModalBtn.addEventListener('click', () => { notificationModal.classList.add('hidden'); checkNotificationsBadge(); });

window.handleNotificationClick = async (notificationId, postId, senderId) => {
    await supabase.from('bildirimler').update({ okundu: true }).eq('id', notificationId);
    notificationModal.classList.add('hidden'); checkNotificationsBadge();
    if (postId && postId !== 'null' && postId !== 'undefined') openSinglePost(postId);
    else if (senderId && senderId !== 'null') openUserProfile(senderId);
};

// --- MESAJLAŞMA (DM) SİSTEMİ ---
async function checkMessagesBadge() {
    if (!currentUserSession) return;
    try {
        const { count } = await supabase.from('mesajlar').select('*', { count: 'exact', head: true }).eq('alici_id', currentUserSession.user.id).eq('okundu', false);
        if (count > 0) messagesBadge.classList.remove('hidden'); else messagesBadge.classList.add('hidden');
    } catch (error) {}
}

messagesBtn.addEventListener('click', () => {
    messagesListModal.classList.remove('hidden');
    setTimeout(() => messagesListModal.classList.remove('translate-x-full'), 10);
    loadConversations();
});

closeMessagesListModalBtn.addEventListener('click', () => {
    messagesListModal.classList.add('translate-x-full');
    setTimeout(() => messagesListModal.classList.add('hidden'), 300);
});

async function loadConversations() {
    conversationsList.innerHTML = '<div class="text-center text-slate-400 mt-10"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i></div>';
    try {
        const { data: msgs, error } = await supabase.from('mesajlar').select('*, gonderen:uyeler!gonderen_id(id, ad_soyad, avatar_url), alici:uyeler!alici_id(id, ad_soyad, avatar_url)').or(`gonderen_id.eq.${currentUserSession.user.id},alici_id.eq.${currentUserSession.user.id}`).order('created_at', { ascending: false });
        if (error) throw error;
        if (!msgs || msgs.length === 0) { conversationsList.innerHTML = '<p class="text-center mt-10 text-slate-500">Mesaj kutunuz boş.</p>'; return; }

        const convos = {};
        msgs.forEach(m => {
            const isMeSender = m.gonderen_id === currentUserSession.user.id;
            const otherUser = isMeSender ? m.alici : m.gonderen;
            if (!convos[otherUser.id]) {
                convos[otherUser.id] = { user: otherUser, lastMsg: m.metin || '📷 Görsel', date: new Date(m.created_at), isUnread: !isMeSender && !m.okundu, senderLabel: isMeSender ? 'Sen: ' : '' };
            }
        });

        conversationsList.innerHTML = '';
        Object.values(convos).forEach(c => {
            const avatar = c.user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user.ad_soyad)}`;
            const bgClass = c.isUnread ? 'bg-blue-50 border-blue-100' : 'bg-white border-white';
            const textWeight = c.isUnread ? 'font-bold text-slate-800' : 'font-normal text-slate-500';
            
            conversationsList.insertAdjacentHTML('beforeend', `
                <div class="p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors border-b ${bgClass}" onclick="openChat('${c.user.id}', '${c.user.ad_soyad}', '${avatar}')">
                    <img src="${avatar}" class="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-slate-200">
                    <div class="flex-1 overflow-hidden">
                        <div class="font-bold text-[14px] text-slate-800">${c.user.ad_soyad}</div>
                        <div class="text-[13px] truncate mt-0.5 ${textWeight}">${c.senderLabel}${c.lastMsg}</div>
                    </div>
                    ${c.isUnread ? '<span class="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>' : ''}
                </div>
            `);
        });
    } catch (error) { conversationsList.innerHTML = '<p class="text-center text-red-500 mt-10">Yüklenemedi.</p>'; }
}

window.openChat = async (targetId, targetName, targetAvatar) => {
    currentChatUserId = targetId;
    chatUserName.innerText = targetName; chatUserAvatar.src = targetAvatar;
    chatUserAvatar.setAttribute('data-user-id', targetId); chatUserName.setAttribute('data-user-id', targetId);
    
    chatModal.classList.remove('hidden'); setTimeout(() => chatModal.classList.remove('translate-x-full'), 10);
    chatHistory.innerHTML = '<div class="flex-1 flex items-center justify-center"><i class="fa-solid fa-spinner fa-spin text-2xl text-slate-400"></i></div>';

    try {
        await supabase.from('mesajlar').update({ okundu: true }).eq('alici_id', currentUserSession.user.id).eq('gonderen_id', targetId).eq('okundu', false);
        checkMessagesBadge();
        if(!messagesListModal.classList.contains('hidden')) loadConversations();

        const { data: history, error } = await supabase
            .from('mesajlar')
            .select('*')
            .in('gonderen_id', [currentUserSession.user.id, targetId])
            .in('alici_id', [currentUserSession.user.id, targetId])
            .order('created_at', { ascending: true });

        if (error) throw error;

        chatHistory.innerHTML = '';
        if (history && history.length > 0) {
            history.forEach(msg => appendMessageToUI(msg, msg.gonderen_id === currentUserSession.user.id));
        } else {
            chatHistory.innerHTML = '<p id="empty-chat-msg" class="text-center text-slate-400 mt-10 text-sm">İlk mesajı sen gönder!</p>';
        }
        scrollToChatBottom();
    } catch (error) { 
        chatHistory.innerHTML = '<p class="text-center text-red-500 mt-10">Sohbet yüklenemedi.</p>'; 
    }
};

function appendMessageToUI(msg, isMine) {
    const emptyMsg = document.getElementById('empty-chat-msg');
    if (emptyMsg) emptyMsg.remove();

    const timeStr = new Date(msg.created_at).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
    const mediaHtml = msg.medya_url ? `<img src="${msg.medya_url}" class="w-full max-w-[200px] h-auto rounded-lg mb-1 pointer-events-none">` : '';
    const textHtml = (msg.metin && msg.metin !== '📷 Görsel') ? `<div class="whitespace-pre-wrap leading-relaxed">${msg.metin}</div>` : '';
    
    const readHtml = isMine ? `<i class="msg-read-status fa-solid ${msg.okundu ? 'fa-check-double text-blue-500' : 'fa-check text-slate-400'} ml-1"></i>` : '';
    const heartClass = msg.begendi ? 'scale-100 opacity-100' : 'scale-0 opacity-0';

    if (isMine) {
        chatHistory.insertAdjacentHTML('beforeend', `
            <div class="flex flex-col items-end w-full animate-fade-in relative mb-3" id="msg-wrapper-${msg.id}">
                <div class="msg-bubble relative bg-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[75%] text-[14px] shadow-sm cursor-pointer select-none" data-msg-id="${msg.id}" data-is-mine="true" data-is-liked="${!!msg.begendi}">
                    ${mediaHtml}
                    ${textHtml}
                    <div class="msg-heart absolute -bottom-2 -left-2 bg-slate-800 rounded-full w-6 h-6 flex items-center justify-center shadow-md border-2 border-white transition-all duration-300 ${heartClass}"><i class="fa-solid fa-heart text-red-500 text-[11px]"></i></div>
                </div>
                <div class="flex items-center text-[10px] text-slate-400 mt-1 mr-1"><span>${timeStr}</span>${readHtml}</div>
            </div>
        `);
    } else {
        chatHistory.insertAdjacentHTML('beforeend', `
            <div class="flex items-end gap-2 w-full animate-fade-in relative mb-3" id="msg-wrapper-${msg.id}">
                <img src="${chatUserAvatar.src}" class="w-7 h-7 rounded-full object-cover mb-4 border border-slate-200">
                <div class="flex flex-col items-start w-full">
                    <div class="msg-bubble relative bg-white border border-slate-200 text-slate-800 px-4 py-2.5 rounded-2xl rounded-bl-sm max-w-[75%] text-[14px] shadow-sm cursor-pointer select-none" data-msg-id="${msg.id}" data-is-mine="false" data-is-liked="${!!msg.begendi}">
                        ${mediaHtml}
                        ${textHtml}
                        <div class="msg-heart absolute -bottom-2 -right-2 bg-slate-800 rounded-full w-6 h-6 flex items-center justify-center shadow-md border-2 border-white transition-all duration-300 ${heartClass}"><i class="fa-solid fa-heart text-red-500 text-[11px]"></i></div>
                    </div>
                    <span class="text-[10px] text-slate-400 mt-1 ml-1">${timeStr}</span>
                </div>
            </div>
        `);
    }
    scrollToChatBottom();
}

function scrollToChatBottom() { chatHistory.scrollTop = chatHistory.scrollHeight; }

closeChatBtn.addEventListener('click', () => {
    currentChatUserId = null;
    chatModal.classList.add('translate-x-full'); setTimeout(() => chatModal.classList.add('hidden'), 300);
});

chatInput.addEventListener('input', () => {
    if(currentChatUserId && chatBroadcastChannel) {
        chatBroadcastChannel.send({ type: 'broadcast', event: 'typing', payload: { from: currentUserSession.user.id, to: currentChatUserId } });
    }
});

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!currentChatUserId || !text) return;
    chatInput.value = ''; 
    
    try {
        const { error } = await supabase.from('mesajlar').insert([{ gonderen_id: currentUserSession.user.id, alici_id: currentChatUserId, metin: text }]);
        if (error) throw error;
        if(!messagesListModal.classList.contains('hidden')) loadConversations();
    } catch (err) { Swal.fire({ icon: 'error', title: 'Hata', text: 'Mesaj iletilemedi.' }); }
});

chatMediaInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if(!file || !currentChatUserId) return;
    e.target.value = ''; 
    
    chatHistory.insertAdjacentHTML('beforeend', `<div class="text-center text-xs text-slate-400 my-2" id="img-upload-loading">Fotoğraf gönderiliyor...</div>`);
    scrollToChatBottom();

    try {
        const ext = file.name.split('.').pop();
        const fileName = `dm-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('medya').upload(fileName, file);
        if(uploadError) throw uploadError;
        
        const finalMediaUrl = supabase.storage.from('medya').getPublicUrl(fileName).data.publicUrl;
        await supabase.from('mesajlar').insert([{ gonderen_id: currentUserSession.user.id, alici_id: currentChatUserId, metin: '📷 Görsel', medya_url: finalMediaUrl }]);
    } catch(err) {
        Swal.fire({icon:'error', text:'Görsel gönderilemedi'});
    } finally {
        const loader = document.getElementById('img-upload-loading');
        if(loader) loader.remove();
    }
});

let msgPressTimer;
chatHistory.addEventListener('mousedown', handleMsgPressStart);
chatHistory.addEventListener('touchstart', handleMsgPressStart);
chatHistory.addEventListener('mouseup', handleMsgPressEnd);
chatHistory.addEventListener('mouseleave', handleMsgPressEnd);
chatHistory.addEventListener('touchend', handleMsgPressEnd);
chatHistory.addEventListener('touchmove', handleMsgPressEnd);

function handleMsgPressStart(e) {
    const bubble = e.target.closest('.msg-bubble');
    if(bubble) {
        const msgId = bubble.getAttribute('data-msg-id');
        const isMine = bubble.getAttribute('data-is-mine') === 'true';
        msgPressTimer = setTimeout(() => {
            if(isMine) {
                Swal.fire({title: 'Mesajı Sil?', icon: 'warning', showCancelButton:true, confirmButtonText:'Sil', cancelButtonText:'İptal', confirmButtonColor: '#d33'}).then(async res => {
                    if(res.isConfirmed) {
                        const wrapper = document.getElementById(`msg-wrapper-${msgId}`);
                        if(wrapper) {
                            wrapper.style.opacity = '0';
                            setTimeout(() => wrapper.remove(), 200);
                        }
                        await supabase.from('mesajlar').delete().eq('id', msgId);
                    }
                })
            }
        }, 600); 
    }
}
function handleMsgPressEnd() { clearTimeout(msgPressTimer); }

chatHistory.addEventListener('dblclick', async (e) => {
    const bubble = e.target.closest('.msg-bubble');
    if(bubble) {
        if(window.getSelection) window.getSelection().removeAllRanges();
        const msgId = bubble.getAttribute('data-msg-id');
        const isLiked = bubble.getAttribute('data-is-liked') === 'true';
        
        bubble.setAttribute('data-is-liked', (!isLiked).toString());
        const heart = bubble.querySelector('.msg-heart');
        
        if(!isLiked) { 
            heart.classList.remove('scale-0', 'opacity-0');
            heart.classList.add('scale-100', 'opacity-100', 'chat-heart-anim');
        } else { 
            heart.classList.remove('scale-100', 'opacity-100', 'chat-heart-anim');
            heart.classList.add('scale-0', 'opacity-0');
        }

        await supabase.from('mesajlar').update({begendi: !isLiked}).eq('id', msgId);
    }
});

// --- GÖNDERİ OLUŞTURMA YENİ (TAKİPÇİLERE BİLDİRİM GÖNDERME EKLENDİ) ---
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
    submitPostBtn.innerHTML = 'Paylaşılıyor...'; submitPostBtn.disabled = true;
    try {
        let finalMediaUrl = null;
        if (document.querySelector('input[name="post_type"]:checked').value === 'medya' && postMediaInput.files[0]) {
            const file = postMediaInput.files[0];
            const ext = file.name.split('.').pop();
            const fileName = `post-${Date.now()}.${ext}`;
            await supabase.storage.from('medya').upload(fileName, file);
            finalMediaUrl = supabase.storage.from('medya').getPublicUrl(fileName).data.publicUrl;
        }

        // GÖNDERİYİ EKLE VE ID'SİNİ AL (YENİ)
        const { data: newPost, error: insertErr } = await supabase.from('gonderiler').insert([{ user_id: currentUserSession.user.id, gonderi_tipi: document.querySelector('input[name="post_type"]:checked').value, metin: postTextInput.value, medya_url: finalMediaUrl }]).select().single();
        if (insertErr) throw insertErr;

        // TAKİPÇİLERE BİLDİRİM GÖNDER (YENİ MANTIK)
        const { data: followers } = await supabase.from('takipler').select('takip_eden_id').eq('takip_edilen_id', currentUserSession.user.id);
        if (followers && followers.length > 0) {
            const notifications = followers.map(f => ({
                alici_id: f.takip_eden_id,
                gonderen_id: currentUserSession.user.id,
                mesaj: 'yeni bir gönderi paylaştı.',
                gonderi_id: newPost.id
            }));
            await supabase.from('bildirimler').insert(notifications);
        }

        createPostModal.classList.add('hidden'); createPostForm.reset(); mediaUploadContainer.classList.add('hidden');
        loadFeed(currentFeedFilter);
    } catch (error) {} finally { submitPostBtn.innerHTML = 'Paylaş'; submitPostBtn.disabled = false; }
});

feedFilters.forEach(btn => {
    btn.addEventListener('click', (e) => {
        feedFilters.forEach(f => f.className = "feed-filter px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold shadow-sm");
        e.target.className = "feed-filter active px-4 py-1.5 rounded-full bg-slate-800 text-white text-sm font-semibold transition-colors";
        currentFeedFilter = e.target.getAttribute('data-filter');
        loadFeed(currentFeedFilter);
    });
});

// --- TEMPLATE GENERATOR ---
function generatePostHTML(post, isSingleView = false) {
    const author = post.yazar || {};
    const avatar = author.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.ad_soyad || 'U')}&background=1e3a8a&color=fff`;
    const likesCount = post.etkilesimler ? post.etkilesimler.length : 0;
    const isLikedByMe = post.etkilesimler ? post.etkilesimler.some(e => e.user_id === currentUserSession.user.id) : false;
    
    let postOptionsHTML = '';
    if (currentUserSession.user.id === post.user_id) {
        const canEdit = ((new Date() - new Date(post.created_at)) / (1000 * 60)) <= 15;
        postOptionsHTML = `
            <div class="relative group ml-auto">
                <button class="text-slate-400 p-2"><i class="fa-solid fa-ellipsis-vertical pointer-events-none"></i></button>
                <div class="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 overflow-hidden">
                    ${canEdit ? `<button class="edit-post-btn w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" data-post-id="${post.id}" data-text="${encodeURIComponent(post.metin)}">Düzenle</button>` : ''}
                    <button class="delete-post-btn w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50" data-post-id="${post.id}">Sil</button>
                </div>
            </div>
        `;
    }

    let commentsHTML = '';
    const allComments = post.gonderi_yorumlari || [];
    allComments.filter(c => !c.ust_yorum_id).forEach(comment => {
        const cAuthor = comment.yazar || {};
        const cAvatar = cAuthor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(cAuthor.ad_soyad || 'U')}`;
        let cOptions = currentUserSession.user.id === comment.user_id ? `<button class="delete-comment-btn hover:text-red-500 ml-2" data-comment-id="${comment.id}">Sil</button>` : '';

        commentsHTML += `
            <div class="flex gap-2 items-start mt-4">
                <img src="${cAvatar}" class="w-8 h-8 rounded-full object-cover border border-slate-200 cursor-pointer user-profile-trigger" data-user-id="${comment.user_id}">
                <div class="flex-1">
                    <div class="bg-slate-100 px-3 py-1.5 rounded-xl inline-block">
                        <span class="font-bold text-[13px] text-slate-800 mr-2 cursor-pointer hover:underline user-profile-trigger" data-user-id="${comment.user_id}">${cAuthor.ad_soyad}</span>
                        <span class="text-sm text-slate-700">${comment.metin}</span>
                    </div>
                    <div class="flex gap-2 mt-0.5 ml-2 text-[11px] text-slate-400 font-semibold">
                        <button class="reply-to-comment-btn hover:text-slate-800" data-post-id="${post.id}" data-comment-id="${comment.id}" data-author-name="${cAuthor.ad_soyad}">Yanıtla</button>${cOptions}
                    </div>
        `;

        allComments.filter(r => r.ust_yorum_id === comment.id).forEach(reply => {
            const rAuthor = reply.yazar || {};
            const rAvatar = rAuthor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(rAuthor.ad_soyad || 'U')}`;
            let rOptions = currentUserSession.user.id === reply.user_id ? `<button class="delete-comment-btn hover:text-red-500 ml-2" data-comment-id="${reply.id}">Sil</button>` : '';

            commentsHTML += `
                <div class="flex gap-2 items-start mt-2 ml-4 border-l-2 pl-2 border-slate-200">
                    <img src="${rAvatar}" class="w-6 h-6 rounded-full object-cover border border-slate-200 cursor-pointer user-profile-trigger" data-user-id="${reply.user_id}">
                    <div class="flex-1">
                        <div class="bg-slate-100 px-3 py-1.5 rounded-xl inline-block">
                            <span class="font-bold text-[12px] text-slate-800 mr-1 cursor-pointer hover:underline user-profile-trigger" data-user-id="${reply.user_id}">${rAuthor.ad_soyad}</span>
                            <span class="text-[13px] text-slate-700">${reply.metin}</span>
                        </div>
                        <div class="flex gap-2 mt-0.5 ml-2 text-[10px] text-slate-400 font-semibold">${rOptions}</div>
                    </div>
                </div>
            `;
        });
        commentsHTML += '</div></div>';
    });

    let mediaHTML = '';
    if (post.gonderi_tipi === 'medya' && post.medya_url) {
        if (post.medya_url.endsWith('.mp4')) {
            mediaHTML = `<video controls class="w-full h-auto max-h-96 object-cover bg-black mt-3 rounded-xl pointer-events-auto"><source src="${post.medya_url}"></video>`;
        } else {
            mediaHTML = `
                <div class="relative mt-3 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                    <img src="${post.medya_url}" class="post-media-item w-full h-auto max-h-96 object-cover pointer-events-auto cursor-pointer" data-post-id="${post.id}" data-author-id="${post.user_id}">
                    <i class="fa-solid fa-heart absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-6xl opacity-0 pointer-events-none drop-shadow-md z-10" id="big-heart-${post.id}"></i>
                </div>
            `;
        }
    }

    return `
        <div id="post-${post.id}" class="post-card no-select bg-white p-5 rounded-2xl shadow-sm border border-slate-200 transition-all duration-300" data-post-id="${post.id}">
            <div class="flex justify-between items-start mb-3 pointer-events-auto">
                <div class="flex items-center gap-3">
                    <img src="${avatar}" class="w-11 h-11 rounded-full object-cover border border-slate-200 cursor-pointer user-profile-trigger" data-user-id="${post.user_id}">
                    <div>
                        <h4 class="font-bold text-slate-800 text-sm flex items-center gap-2 cursor-pointer hover:underline user-profile-trigger" data-user-id="${post.user_id}">
                            ${author.ad_soyad || 'Bilinmeyen'}
                            <span class="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] uppercase tracking-wide border border-blue-100">${author.rol || 'Müşteri'}</span>
                        </h4>
                        <p class="text-[11px] text-slate-400">${new Date(post.created_at).toLocaleDateString('tr-TR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</p>
                    </div>
                </div>
                ${postOptionsHTML}
            </div>
            
            <div class="text-slate-800 text-[15px] whitespace-pre-wrap pointer-events-auto">${post.metin}</div>
            ${mediaHTML}
            
            <div class="flex items-center gap-6 mt-4 pt-3 border-t border-slate-100 pointer-events-auto">
                <button class="action-btn like-btn flex items-center gap-2 text-sm font-semibold transition-colors ${isLikedByMe ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}" data-post-id="${post.id}" data-author-id="${post.user_id}">
                    <i class="${isLikedByMe ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}" id="like-icon-${post.id}" style="pointer-events:none;"></i> <span style="pointer-events:none;" id="like-count-${post.id}">${likesCount > 0 ? likesCount : 'Beğen'}</span>
                </button>
                <button class="action-btn comment-toggle-btn flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors text-sm font-semibold" data-post-id="${post.id}">
                    <i class="fa-regular fa-comment pointer-events-none"></i> <span class="pointer-events-none">${allComments.length > 0 ? allComments.length : 'Yorum Yap'}</span>
                </button>
            </div>

            <div class="comment-section ${isSingleView ? '' : 'hidden'} mt-4 pt-4 border-t border-slate-100 pointer-events-auto" id="comment-section-${post.id}">
                <div class="mb-4 space-y-1">${commentsHTML}</div>
                <div id="reply-indicator-${post.id}" class="hidden items-center justify-between bg-blue-50 text-blue-700 px-3 py-1.5 rounded-t-lg text-xs font-bold border border-blue-100 border-b-0">
                    <span><i class="fa-solid fa-reply mr-1"></i> <span id="reply-name-${post.id}"></span> kullanıcısına yanıt veriliyor</span>
                    <button class="cancel-reply-btn hover:text-red-500" data-post-id="${post.id}"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="flex gap-2">
                    <input type="text" id="comment-input-${post.id}" class="flex-1 px-4 py-2 bg-slate-100 border border-slate-200 rounded-full text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors" placeholder="Yorum ekle...">
                    <button class="submit-comment-btn w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-sm transition-colors" data-post-id="${post.id}" data-author-id="${post.user_id}">
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
        const { data: posts } = await query;
        if (!posts || posts.length === 0) { feedList.innerHTML = '<div class="bg-white p-8 border border-slate-200 rounded-xl text-center text-slate-500"><i class="fa-regular fa-folder-open text-3xl mb-2"></i><p>Henüz paylaşım yok.</p></div>'; return; }
        feedList.innerHTML = '';
        posts.forEach(p => feedList.insertAdjacentHTML('beforeend', generatePostHTML(p, false)));
    } catch (e) {}
}

// --- OPTIMISTIC UI & EVENT DELEGATION ---
document.addEventListener('click', async (e) => {
    if (!currentUserSession) return;
    const target = e.target;

    if (target.classList.contains('like-btn')) {
        const postId = target.getAttribute('data-post-id');
        const authorId = target.getAttribute('data-author-id');
        const icon = document.getElementById(`like-icon-${postId}`);
        const countSpan = document.getElementById(`like-count-${postId}`);
        const isLiked = icon.classList.contains('fa-solid');
        let currentCount = parseInt(countSpan.innerText) || 0;

        if (isLiked) {
            icon.className = "fa-regular fa-heart"; target.classList.replace('text-red-500', 'text-slate-500');
            countSpan.innerText = currentCount > 1 ? currentCount - 1 : 'Beğen';
        } else {
            icon.className = "fa-solid fa-heart text-red-500"; target.classList.replace('text-slate-500', 'text-red-500');
            countSpan.innerText = isNaN(currentCount) || currentCount === 0 ? 1 : currentCount + 1;
        }

        try {
            const { data: existingLike } = await supabase.from('etkilesimler').select('id').eq('gonderi_id', postId).eq('user_id', currentUserSession.user.id).single();
            if (existingLike) { await supabase.from('etkilesimler').delete().eq('id', existingLike.id); } 
            else {
                await supabase.from('etkilesimler').insert([{ gonderi_id: postId, user_id: currentUserSession.user.id, etkilesim_tipi: 'like' }]);
                if (authorId !== currentUserSession.user.id) await supabase.from('bildirimler').insert([{ alici_id: authorId, gonderen_id: currentUserSession.user.id, mesaj: 'Gönderini beğendi.', gonderi_id: postId }]);
            }
        } catch (err) {}
    }

    if (target.classList.contains('submit-comment-btn')) {
        const postId = target.getAttribute('data-post-id');
        const authorId = target.getAttribute('data-author-id');
        const input = document.getElementById(`comment-input-${postId}`);
        if (!input.value.trim()) return;
        target.disabled = true; target.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        try {
            const parentId = activeReplyData[postId] || null;
            await supabase.from('gonderi_yorumlari').insert([{ gonderi_id: postId, user_id: currentUserSession.user.id, metin: input.value.trim(), ust_yorum_id: parentId }]);
            if (authorId !== currentUserSession.user.id) await supabase.from('bildirimler').insert([{ alici_id: authorId, gonderen_id: currentUserSession.user.id, mesaj: 'Gönderine yorum yaptı.', gonderi_id: postId }]);
            delete activeReplyData[postId]; input.value = '';
            
            const { data: post } = await supabase.from('gonderiler').select(`*, yazar:uyeler(ad_soyad, avatar_url, rol), etkilesimler(id, user_id), gonderi_yorumlari(id, metin, created_at, user_id, ust_yorum_id, yazar:uyeler(ad_soyad, avatar_url, rol))`).eq('id', postId).single();
            document.getElementById(`post-${postId}`).outerHTML = generatePostHTML(post, true);
        } catch(err) {} finally { target.disabled = false; target.innerHTML = '<i class="fa-solid fa-paper-plane text-sm"></i>'; }
    }

    if (target.classList.contains('comment-toggle-btn')) {
        document.getElementById(`comment-section-${target.getAttribute('data-post-id')}`).classList.toggle('hidden');
    }

    if (target.classList.contains('reply-to-comment-btn')) {
        const pId = target.getAttribute('data-post-id');
        activeReplyData[pId] = target.getAttribute('data-comment-id');
        document.getElementById(`reply-indicator-${pId}`).classList.replace('hidden', 'flex');
        document.getElementById(`reply-name-${pId}`).innerText = target.getAttribute('data-author-name');
        document.getElementById(`comment-input-${pId}`).focus();
    }

    if (target.classList.contains('cancel-reply-btn') || target.closest('.cancel-reply-btn')) {
        const pId = (target.getAttribute('data-post-id') || target.closest('.cancel-reply-btn').getAttribute('data-post-id'));
        delete activeReplyData[pId]; document.getElementById(`reply-indicator-${pId}`).classList.replace('flex', 'hidden');
    }

    if (target.classList.contains('delete-post-btn')) {
        const postId = target.getAttribute('data-post-id');
        Swal.fire({
            title: 'Emin misin?', text: "Bu gönderiyi kalıcı olarak sileceksin!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Evet, Sil!', cancelButtonText: 'İptal'
        }).then(async (result) => {
            if (result.isConfirmed) { await supabase.from('gonderiler').delete().eq('id', postId); loadFeed(currentFeedFilter); closeSinglePostBtn.click(); }
        });
    }

    if (target.classList.contains('delete-comment-btn')) {
        const commentId = target.getAttribute('data-comment-id');
        Swal.fire({
            title: 'Yorumu Sil?', text: "Bu yorumu kalıcı olarak sileceksin!", icon: 'question', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Sil', cancelButtonText: 'İptal'
        }).then(async (result) => {
            if (result.isConfirmed) { await supabase.from('gonderi_yorumlari').delete().eq('id', commentId); loadFeed(currentFeedFilter); }
        });
    }

    if (target.classList.contains('edit-post-btn')) {
        const postId = target.getAttribute('data-post-id');
        const oldText = decodeURIComponent(target.getAttribute('data-text'));
        const { value: newText } = await Swal.fire({ input: 'textarea', inputValue: oldText, showCancelButton: true, confirmButtonText: 'Kaydet', cancelButtonText: 'İptal' });
        if (newText && newText !== oldText) { await supabase.from('gonderiler').update({ metin: newText }).eq('id', postId); loadFeed(currentFeedFilter); closeSinglePostBtn.click(); }
    }

    if (target.classList.contains('edit-comment-btn')) {
        const commentId = target.getAttribute('data-comment-id');
        const oldText = decodeURIComponent(target.getAttribute('data-text'));
        const { value: newText } = await Swal.fire({ input: 'text', inputValue: oldText, showCancelButton: true, confirmButtonText: 'Kaydet', cancelButtonText: 'İptal' });
        if (newText && newText !== oldText) { await supabase.from('gonderi_yorumlari').update({ metin: newText }).eq('id', commentId); loadFeed(currentFeedFilter); }
    }
});

// YENİ: ÇİFT TIKLA BEĞENME (Insta Mantığı)
document.addEventListener('dblclick', async (e) => {
    if (!currentUserSession) return;
    const target = e.target;
    
    if (target.classList.contains('post-media-item')) {
        if (window.getSelection) { window.getSelection().removeAllRanges(); }
        
        const postId = target.getAttribute('data-post-id');
        const authorId = target.getAttribute('data-author-id');
        
        const bigHeart = document.getElementById(`big-heart-${postId}`);
        if (bigHeart) {
            bigHeart.classList.remove('heart-pop');
            void bigHeart.offsetWidth;
            bigHeart.classList.add('heart-pop');
        }

        const icon = document.getElementById(`like-icon-${postId}`);
        const countSpan = document.getElementById(`like-count-${postId}`);
        const isLiked = icon.classList.contains('fa-solid');
        
        if (!isLiked) {
            let currentCount = parseInt(countSpan.innerText) || 0;
            icon.className = "fa-solid fa-heart text-red-500";
            document.querySelector(`.like-btn[data-post-id="${postId}"]`).classList.replace('text-slate-500', 'text-red-500');
            countSpan.innerText = isNaN(currentCount) || currentCount === 0 ? 1 : currentCount + 1;

            try {
                await supabase.from('etkilesimler').insert([{ gonderi_id: postId, user_id: currentUserSession.user.id, etkilesim_tipi: 'like' }]);
                if (authorId !== currentUserSession.user.id) {
                    await supabase.from('bildirimler').insert([{ alici_id: authorId, gonderen_id: currentUserSession.user.id, mesaj: 'Gönderini beğendi.', gonderi_id: postId }]);
                }
            } catch (err) {}
        }
    }
});

// --- PROFİL VE YÖNLENDİRME ---
window.openUserProfile = async (uId) => {
    currentlyViewingProfileId = uId;
    userProfileModal.classList.remove('hidden'); 
    setTimeout(() => userProfileModal.classList.remove('translate-x-full'), 10);
    tabGrid.click();

    upGrid.innerHTML = '<div class="col-span-3 text-center p-10"><i class="fa-solid fa-spinner fa-spin text-2xl text-slate-400"></i></div>';
    upQuestionsList.innerHTML = '<div class="text-center p-10"><i class="fa-solid fa-spinner fa-spin text-2xl text-slate-400"></i></div>';

    try {
        const { data: user } = await supabase.from('uyeler').select('*').eq('id', uId).single();
        upHeaderName.innerText = user.ad_soyad; upName.innerText = user.ad_soyad; upRole.innerText = user.rol; upBio.innerText = user.biyografi || '';
        const userAvatar = user.avatar_url || 'https://via.placeholder.com/150';
        upAvatar.src = userAvatar;

        if (uId === currentUserSession.user.id) { 
            followBtn.classList.add('hidden'); unfollowBtn.classList.add('hidden'); messageUserBtn.classList.add('hidden');
        } else {
            messageUserBtn.classList.remove('hidden');
            messageUserBtn.onclick = () => {
                userProfileModal.classList.add('translate-x-full');
                setTimeout(() => userProfileModal.classList.add('hidden'), 300);
                openChat(uId, user.ad_soyad, userAvatar);
            };

            const { data: follow } = await supabase.from('takipler').select('id').eq('takip_eden_id', currentUserSession.user.id).eq('takip_edilen_id', uId).single();
            if (follow) { followBtn.classList.add('hidden'); unfollowBtn.classList.remove('hidden'); } 
            else { unfollowBtn.classList.add('hidden'); followBtn.classList.remove('hidden'); }
        }

        const { count: fer } = await supabase.from('takipler').select('*', { count: 'exact', head: true }).eq('takip_edilen_id', uId);
        const { count: fing } = await supabase.from('takipler').select('*', { count: 'exact', head: true }).eq('takip_eden_id', uId);
        upFollowerCount.innerText = fer || 0; upFollowingCount.innerText = fing || 0;

        const { data: posts } = await supabase.from('gonderiler').select(`*, yazar:uyeler(ad_soyad, avatar_url, rol), etkilesimler(id, user_id), gonderi_yorumlari(id, metin, created_at, user_id, ust_yorum_id, yazar:uyeler(ad_soyad, avatar_url, rol))`).eq('user_id', uId).order('created_at', { ascending: false });
        upPostCount.innerText = posts ? posts.length : 0;
        upGrid.innerHTML = ''; upQuestionsList.innerHTML = '';

        if(posts) {
            posts.forEach(p => {
                if (p.gonderi_tipi === 'medya') {
                    let content = p.medya_url.endsWith('.mp4') ? '<div class="absolute inset-0 bg-black flex items-center justify-center text-white"><i class="fa-solid fa-play"></i></div>' : `<img src="${p.medya_url}" class="w-full h-full object-cover">`;
                    upGrid.insertAdjacentHTML('beforeend', `<div class="aspect-square relative cursor-pointer border border-white" onclick="openSinglePost(${p.id})">${content}</div>`);
                } 
                else { upQuestionsList.insertAdjacentHTML('beforeend', generatePostHTML(p, false)); }
            });
            if(upGrid.innerHTML === '') upGrid.innerHTML = '<div class="col-span-3 text-center p-10 text-sm text-slate-400">Medya gönderisi yok.</div>';
            if(upQuestionsList.innerHTML === '') upQuestionsList.innerHTML = '<p class="text-center text-sm text-slate-400 p-10">Soru gönderisi yok.</p>';
        }
    } catch(e) {}
};

document.addEventListener('click', async (e) => {
    const trig = e.target.closest('.user-profile-trigger');
    if (!trig) return;
    const uId = trig.getAttribute('data-user-id');
    if (uId) openUserProfile(uId);
});

closeUserProfileBtn.addEventListener('click', () => { userProfileModal.classList.add('translate-x-full'); setTimeout(() => userProfileModal.classList.add('hidden'), 300); });

followBtn.addEventListener('click', async () => {
    await supabase.from('takipler').insert([{ takip_eden_id: currentUserSession.user.id, takip_edilen_id: currentlyViewingProfileId }]);
    await supabase.from('bildirimler').insert([{ alici_id: currentlyViewingProfileId, gonderen_id: currentUserSession.user.id, mesaj: 'Seni takip etmeye başladı.' }]);
    followBtn.classList.add('hidden'); unfollowBtn.classList.remove('hidden'); upFollowerCount.innerText = parseInt(upFollowerCount.innerText)+1;
});
unfollowBtn.addEventListener('click', async () => {
    await supabase.from('takipler').delete().eq('takip_eden_id', currentUserSession.user.id).eq('takip_edilen_id', currentlyViewingProfileId);
    unfollowBtn.classList.add('hidden'); followBtn.classList.remove('hidden'); upFollowerCount.innerText = parseInt(upFollowerCount.innerText)-1;
});

// --- TEKİL GÖNDERİ POP-UP ---
window.openSinglePost = async (postId) => {
    singlePostModal.classList.remove('hidden'); setTimeout(() => singlePostModal.classList.remove('translate-x-full'), 10);
    singlePostContainer.innerHTML = '<p class="text-center mt-20 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-3xl mb-2"></i><br>Yükleniyor...</p>';
    try {
        const { data: post } = await supabase.from('gonderiler').select(`*, yazar:uyeler(ad_soyad, avatar_url, rol), etkilesimler(id, user_id), gonderi_yorumlari(id, metin, created_at, user_id, ust_yorum_id, yazar:uyeler(ad_soyad, avatar_url, rol))`).eq('id', postId).single();
        singlePostContainer.innerHTML = generatePostHTML(post, true);
    } catch (e) {}
};
closeSinglePostBtn.addEventListener('click', () => { singlePostModal.classList.add('translate-x-full'); setTimeout(() => singlePostModal.classList.add('hidden'), 300); });
