if (window.location.search.includes('fbclid=')) {
  const cleanUrl = window.location.origin + window.location.pathname;
  window.history.replaceState(null, null, cleanUrl);
}

document.addEventListener('DOMContentLoaded', () => {

  const themeBtns = document.querySelectorAll('.theme-btn');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme-target');
      if (theme === 'red-black') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
      if (typeof updateParticleColor === 'function') updateParticleColor();
    });
  });

  const canvas = document.getElementById('particles-canvas');
  let updateParticleColor = () => {};

  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    let particleColor = '#ef4444';

    updateParticleColor = function() {
      const rootStyles = getComputedStyle(document.documentElement);
      particleColor = rootStyles.getPropertyValue('--particle-color').trim() || '#ef4444';
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      draw() {
        ctx.fillStyle = particleColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function initParticles() {
      particlesArray = [];
      let numParticles = Math.floor((canvas.width * canvas.height) / 10000);
      if (numParticles > 150) numParticles = 150;
      for (let i = 0; i < numParticles; i++) {
        particlesArray.push(new Particle());
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
        for (let j = i; j < particlesArray.length; j++) {
          const dx = particlesArray[i].x - particlesArray[j].x;
          const dy = particlesArray[i].y - particlesArray[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = particleColor;
            ctx.globalAlpha = 1 - (distance / 120);
            ctx.lineWidth = 0.5;
            ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
            ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }
      }
      requestAnimationFrame(animateParticles);
    }

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    });

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    updateParticleColor();
    initParticles();
    animateParticles();
  }

  const bgMusic = document.getElementById('bg-music');
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioPrevBtn = document.getElementById('audio-prev-btn');
  const audioNextBtn = document.getElementById('audio-next-btn');
  const playPauseIcon = document.getElementById('play-pause-icon');
  const playlistUl = document.getElementById('playlist-ul');
  let playAudio = () => {};

  if (bgMusic && audioToggleBtn && playlistUl) {
    const audioFiles = [
      "Look What You Made Me Do.mp3",
      "Alximo - Paparazzi (Dubstep) - LONEFINITY.mp3",
      "Rằng Em Mãi Ở Bên - Bích Phương.mp3",
    ];
    const playlist = audioFiles.map(file => {
      return { name: file.replace('.mp3', ''), src: `src/soundboard/${file}` };
    });

    let currentTrackIndex = 0;
    let isPlaying = false;
    bgMusic.src = playlist[currentTrackIndex].src;

    function renderPlaylistUI() {
      playlistUl.innerHTML = '';
      playlist.forEach((track, index) => {
        const li = document.createElement('li');
        const isActive = index === currentTrackIndex;
        li.className = `px-3 py-2 rounded-lg text-xs cursor-pointer transition-all flex items-center gap-2 ${isActive ? 'bg-theme-bg border border-theme-border text-theme-primary font-bold' : 'text-theme-muted hover:bg-theme-bg hover:text-theme-text'}`;
        const displayName = track.name.charAt(0).toUpperCase() + track.name.slice(1);
        li.innerHTML = `
          <i class="fa-solid fa-play ${isActive ? 'text-theme-primary' : 'hidden'}"></i>
          <span class="truncate">${displayName}</span>
        `;
        li.onclick = () => {
          currentTrackIndex = index;
          bgMusic.src = playlist[currentTrackIndex].src;
          playAudio();
          renderPlaylistUI();
        };
        playlistUl.appendChild(li);
      });
    }
    renderPlaylistUI();

    playAudio = function() {
      bgMusic.play().then(() => {
        isPlaying = true;
        if(playPauseIcon) {
          playPauseIcon.classList.remove('fa-play');
          playPauseIcon.classList.add('fa-pause');
        }
        renderPlaylistUI();
      }).catch(err => console.log("Trình duyệt chặn autoplay:", err));
    };

    function pauseAudio() {
      bgMusic.pause();
      isPlaying = false;
      if(playPauseIcon) {
        playPauseIcon.classList.remove('fa-pause');
        playPauseIcon.classList.add('fa-play');
      }
    }

    function nextTrack() {
      currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
      bgMusic.src = playlist[currentTrackIndex].src;
      playAudio();
    }

    function prevTrack() {
      currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
      bgMusic.src = playlist[currentTrackIndex].src;
      playAudio();
    }

    bgMusic.addEventListener('ended', nextTrack);
    audioToggleBtn.addEventListener('click', () => {
      if (isPlaying) pauseAudio(); else playAudio();
    });
    if(audioNextBtn) audioNextBtn.addEventListener('click', nextTrack);
    if(audioPrevBtn) audioPrevBtn.addEventListener('click', prevTrack);
  }

  const introScreen = document.getElementById('intro-screen');
  const introContent = document.getElementById('intro-content');
  const enterBtn = document.getElementById('enter-btn');

  if (enterBtn && introScreen && introContent) {
    enterBtn.addEventListener('click', () => {
      introContent.classList.add('-translate-y-10', 'opacity-0');
      setTimeout(() => {
        introScreen.classList.add('opacity-0');
        setTimeout(() => { introScreen.classList.add('hidden'); }, 700);
      }, 300);
      playAudio();
    });
  }

  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeLightboxBtn = document.getElementById('close-lightbox');
  const galleryItems = document.querySelectorAll('.gallery-item');

  function openLightbox(src) {
    if(!lightboxModal || !lightboxImg || !src) return;
    lightboxImg.src = src;
    lightboxModal.classList.remove('opacity-0', 'pointer-events-none');
    setTimeout(() => { lightboxImg.classList.remove('scale-95'); lightboxImg.classList.add('scale-100'); }, 50);
    document.body.classList.add('overflow-hidden');
  }

  function closeLightbox() {
    if(!lightboxModal || !lightboxImg) return;
    lightboxImg.classList.remove('scale-100'); lightboxImg.classList.add('scale-95');
    setTimeout(() => { lightboxModal.classList.add('opacity-0', 'pointer-events-none'); document.body.classList.remove('overflow-hidden'); }, 300);
  }

  galleryItems.forEach(item => {
    item.addEventListener('click', function() {
      const src = this.getAttribute('data-src');
      openLightbox(src);
    });
  });

  if (closeLightboxBtn) closeLightboxBtn.addEventListener('click', closeLightbox);
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  const translations = {
    vi: {
      intro_sub: "Danh Mục Cá Nhân & Thành Tựu",
      intro_btn: "Khám phá ngay",
      nav_about: "Giới Thiệu",
      nav_skills: "Sở Thích",
      nav_achievements: "Thành Tựu",
      nav_exp: "Kinh Nghiệm",
      hero_status: "Học sinh TH, THCS, THPT Đinh Tiên Hoàng",
      hero_greeting: "Xin chào, tôi là",
      hero_bio: "Sinh năm 2009, hiện đang là học sinh tại Trường TH, THCS, THPT Đinh Tiên Hoàng. Tôi là một người trẻ nhiệt huyết, mang trong mình niềm đam mê mãnh liệt với nghệ thuật thị giác và âm thanh. Thông qua ống kính máy ảnh, những thước phim tự dựng và giọng hát của mình, tôi khao khát được truyền tải những câu chuyện sống động, lưu giữ khoảnh khắc thanh xuân và lan tỏa năng lượng tích cực đến với cộng đồng.",
      download_cv: "Tải xuống CV",
      skills_badge: "Đam mê & Năng lực",
      skills_title: "Sở Thích Nổi Bật",
      skill_card1_title: "Nhiếp Ảnh",
      skill_card1_desc: "Từng góc máy là một góc nhìn đa chiều. Nhiếp ảnh đối với tôi không chỉ là sở thích mà còn là công cụ để lưu giữ thanh xuân, kể những câu chuyện không lời qua từng khung hình chân thật và đầy cảm xúc.",
      skill_card2_title: "Ca Hát",
      skill_card2_desc: "Âm nhạc là ngôn ngữ của tâm hồn. Qua từng giai điệu, tôi tìm thấy sự đồng điệu để bộc lộ cảm xúc sâu kín và mang lại nguồn năng lượng tích cực, kết nối mọi người lại gần nhau hơn trong các sự kiện.",
      skill_card3_title: "Dựng Phim",
      skill_card3_desc: "Biến những mảnh ghép hình ảnh rời rạc thành tác phẩm nghệ thuật. Tôi say mê nghiên cứu nhịp điệu cắt ghép, hiệu ứng âm thanh và màu sắc để tạo ra những thước phim truyền tải thông điệp lôi cuốn.",
      projects_badge: "Góc Tự Hào",
      projects_title: "Bảng Vàng Thành Tích",
      achievements_subtext: "Thư viện lưu giữ những khoảnh khắc, giải thưởng và chứng nhận đáng tự hào.",
      tag_award: "Giải thưởng",
      tag_volunteer: "Tình nguyện",
      tag_activity: "Hoạt động",
      tag_event: "Sự kiện",
      ach_1_title: "Giải Nhất - Thiết kế video \"Trường tui là nhất\"",
      ach_1_desc: "Xuất sắc vượt qua các thí sinh toàn tỉnh Đồng Nai (năm 2025) để giành ngôi vị cao nhất với thước phim đầy tự hào về mái trường.",
      ach_2_title: "Á quân UMT Creative Challenge",
      ach_2_desc: "Khẳng định tài năng sáng tạo nội dung truyền thông tại cuộc thi do Đại học Quản lý và Công nghệ TP.HCM (UMT) tổ chức.",
      ach_3_title: "Best Viral TVC - UMT Creative Challenge",
      ach_3_desc: "Giải TVC lan truyền xuất sắc nhất trong khuôn khổ cuộc thi thử thách sáng tạo của UMT.",
      ach_4_title: "Chứng nhận Báo Thanh Niên",
      ach_4_desc: "Giấy chứng nhận tham gia tích cực chiến dịch nhặt rác toàn quốc Clean Up Việt Nam lần 8.",
      ach_5_title: "Tình nguyện viên xuất sắc (Cộng Đồng Xanh)",
      ach_5_desc: "Ghi nhận sự cống hiến cho chiến dịch Clean Up Việt Nam lần 8, hướng ứng Ngày \"Làm cho thế giới sạch hơn\".",
      ach_6_title: "Trưởng ban Truyền thông",
      ach_6_desc: "Chứng nhận hoàn thành xuất sắc vai trò Trưởng ban Truyền thông của Câu lạc bộ Nghệ thuật ĐTH.",
      ach_7_title: "Trung tâm Truyền thông Tài nguyên & Môi trường",
      ach_7_desc: "Chứng nhận Tình nguyện viên xuất sắc chiến dịch Clean Up Việt Nam lần 7 (Chủ đề: Đại dương kỳ diệu).",
      ach_8_title: "Tác nghiệp Truyền thông Kỷ niệm 101 năm Báo chí CMVN",
      ach_8_desc: "Phụ trách hình ảnh và truyền thông tại sự kiện trang trọng do ABBank tổ chức.",
      ach_9_title: "Các Giải thưởng Nổi bật Khác",
      ach_9_li1: "Giải Nhì - Thiết kế video tri ân thầy cô (2024)",
      ach_9_li2: "Giải Nhì - Review sách \"Ngày hội đọc sách\" (2025)",
      ach_9_li3: "Giải Nhì - Infographic \"Tìm hiểu vua Đinh Tiên Hoàng\" (2025)",
      exp_badge: "Dấu Ấn",
      exp_title: "Kinh Nghiệm Thực Tế",
      exp_cat1: "Nhiếp Ảnh & Sự Kiện",
      exp_desc1: "<ul class='space-y-3'><li class='relative pl-4 before:absolute before:left-0 before:top-1.5 sm:before:top-2 before:w-1.5 before:h-1.5 before:bg-[var(--primary-color)] before:rounded-full'><strong class='text-theme-text font-semibold'>120 năm Nước mắm Liên Thành:</strong> Đảm nhận chụp ảnh sự kiện trọng đại và lễ khánh thành triển lãm quy mô lớn.</li><li class='relative pl-4 before:absolute before:left-0 before:top-1.5 sm:before:top-2 before:w-1.5 before:h-1.5 before:bg-[var(--primary-color)] before:rounded-full'><strong class='text-theme-text font-semibold'>101 năm Báo chí Cách mạng VN:</strong> Tác nghiệp nhiếp ảnh (21/06/2026), bắt trọn những khoảnh khắc tri ân trang trọng.</li><li class='relative pl-4 before:absolute before:left-0 before:top-1.5 sm:before:top-2 before:w-1.5 before:h-1.5 before:bg-[var(--primary-color)] before:rounded-full'><strong class='text-theme-text font-semibold'>Nhiếp ảnh Kỷ yếu (Freelance):</strong> Thực hiện các bộ ảnh thanh xuân nghệ thuật cho học sinh tại: THPT Đinh Tiên Hoàng, Giồng Ông Tố (TP.HCM), Vĩnh Cửu, Bùi Thị Xuân, Lê Quý Đôn - Quyết Thắng...</li></ul>",
      exp_cat2: "Truyền Thông & Tổ Chức",
      exp_desc2: "<ul class='space-y-3'><li class='relative pl-4 before:absolute before:left-0 before:top-1.5 sm:before:top-2 before:w-1.5 before:h-1.5 before:bg-[var(--primary-color)] before:rounded-full'><strong class='text-theme-text font-semibold'>Ban tổ chức CLEANUP 8 VN:</strong> Tham gia hỗ trợ truyền thông với vai trò ban tổ chức chiến dịch của Xanh Đồng Nai.</li><li class='relative pl-4 before:absolute before:left-0 before:top-1.5 sm:before:top-2 before:w-1.5 before:h-1.5 before:bg-[var(--primary-color)] before:rounded-full'><strong class='text-theme-text font-semibold'>Sự kiện UCC 2025 (UMT):</strong> Hỗ trợ chuyên môn truyền thông cho sự kiện lớn của CLB Marketing, Đại học Quản lý và Công nghệ TP.HCM.</li><li class='relative pl-4 before:absolute before:left-0 before:top-1.5 sm:before:top-2 before:w-1.5 before:h-1.5 before:bg-[var(--primary-color)] before:rounded-full'><strong class='text-theme-text font-semibold'>Hỗ trợ Truyền thông Học đường:</strong> Đóng vai trò khách mời truyền thông Hội trại THCS Tam Phước, Hội trại (2024) và Lễ tri ân (2024, 2025) tại trường Đinh Tiên Hoàng.</li></ul>",
      exp_cat3: "Hoạt Động Tình Nguyện",
      exp_desc3: "<ul class='space-y-3'><li class='relative pl-4 before:absolute before:left-0 before:top-1.5 sm:before:top-2 before:w-1.5 before:h-1.5 before:bg-[var(--primary-color)] before:rounded-full'><strong class='text-theme-text font-semibold'>EARTHDAY VIỆT NAM 2025:</strong> Hoạt động năng nổ với vai trò Tình nguyện viên ban truyền thông, sáng tạo nội dung lan tỏa lối sống xanh.</li><li class='relative pl-4 before:absolute before:left-0 before:top-1.5 sm:before:top-2 before:w-1.5 before:h-1.5 before:bg-[var(--primary-color)] before:rounded-full'><strong class='text-theme-text font-semibold'>CLEANUP 7 VIỆT NAM:</strong> Xông pha tại hiện trường, ghi hình và viết bài truyền thông bảo vệ môi trường cùng Xanh Đồng Nai.</li><li class='relative pl-4 before:absolute before:left-0 before:top-1.5 sm:before:top-2 before:w-1.5 before:h-1.5 before:bg-[var(--primary-color)] before:rounded-full'><strong class='text-theme-text font-semibold'>Ngày Chủ nhật xanh cấp TP lần III:</strong> Đóng góp sức trẻ, lan tỏa thông điệp bảo vệ môi trường, giữ gìn cảnh quan sạch đẹp đến cộng đồng.</li></ul>",
      footer_quote: "\"Nghệ thuật là cách tôi lưu giữ thanh xuân và kể những câu chuyện không lời.\"",
      footer_copy: "©2026 callme.hanbe | Designed By Nguyễn Hoàng Quân."
    },
    en: {
      intro_sub: "Personal Portfolio & Achievements",
      intro_btn: "Enter Portfolio",
      nav_about: "About",
      nav_skills: "Passions",
      nav_achievements: "Achievements",
      nav_exp: "Experience",
      hero_status: "Student at Dinh Tien Hoang School",
      hero_greeting: "Hello, I am",
      hero_bio: "Born in 2009, currently a student at Dinh Tien Hoang School. I am a passionate youth with a strong love for visual arts and sound. Through my camera lens, self-edited footage, and singing, I constantly aspire to tell vivid stories, preserve the most beautiful moments of youth, and spread positive energy to the community.",
      download_cv: "Download CV",
      skills_badge: "Passions & Abilities",
      skills_title: "Highlighted Interests",
      skill_card1_title: "Photography",
      skill_card1_desc: "Every angle is a multi-dimensional perspective. Photography is not just a hobby but a tool to preserve youth and tell wordless stories through authentic, emotional frames.",
      skill_card2_title: "Singing",
      skill_card2_desc: "Music is the language of the soul. Through every melody, I find a way to express deep emotions and bring positive energy, connecting people together in events.",
      skill_card3_title: "Video Editing",
      skill_card3_desc: "Turning fragmented visuals into masterpieces. I am passionate about editing rhythm, sound design, and color grading to create compelling stories.",
      projects_badge: "Proud Moments",
      projects_title: "Wall of Achievements",
      achievements_subtext: "A vertical list of proud moments, awards, and certificates.",
      tag_award: "Award",
      tag_volunteer: "Volunteer",
      tag_activity: "Activity",
      tag_event: "Event",
      ach_1_title: "First Prize - \"My School is the Best\" Video Contest",
      ach_1_desc: "Outstandingly won the highest position in Dong Nai province (2025) with an inspiring video about the school.",
      ach_2_title: "Runner-up UMT Creative Challenge",
      ach_2_desc: "Showcased media content creation talent at the competition hosted by UMT University.",
      ach_3_title: "Best Viral TVC - UMT Creative Challenge",
      ach_3_desc: "Won the Best Viral TVC award within the UMT creative challenge framework.",
      ach_4_title: "Thanh Nien Newspaper Certificate",
      ach_4_desc: "Certificate for active participation in the 8th Clean Up Vietnam national campaign.",
      ach_5_title: "Outstanding Volunteer (Green Community)",
      ach_5_desc: "Recognized for dedication to the 8th Clean Up Vietnam campaign, supporting 'Clean Up the World' Day.",
      ach_6_title: "Head of Communications",
      ach_6_desc: "Certificate of excellence as Head of Communications for the DTH Arts Club.",
      ach_7_title: "Natural Resources & Environment Media Center",
      ach_7_desc: "Outstanding Volunteer Certificate for the 7th Clean Up Vietnam campaign (Theme: Magical Ocean).",
      ach_8_title: "Media Coverage - 101st VN Press Day",
      ach_8_desc: "In charge of photography and media for the solemn event organized by ABBank.",
      ach_9_title: "Other Highlighted Awards",
      ach_9_li1: "Second Prize - Teachers Gratitude Video Design (2024)",
      ach_9_li2: "Second Prize - Book Review Video (2025)",
      ach_9_li3: "Second Prize - King Dinh Tien Hoang Infographic (2025)",
      exp_badge: "Milestones",
      exp_title: "Practical Experience",
      exp_cat1: "Photography & Events",
      exp_desc1: "<ul class='space-y-3'><li class='relative pl-4 before:absolute before:left-0 before:top-1.5 sm:before:top-2 before:w-1.5 before:h-1.5 before:bg-[var(--primary-color)] before:rounded-full'><strong class='text-theme-text font-semibold'>Lien Thanh 120th Anniversary:</strong> Official event photographer for the grand anniversary and exhibition opening.</li><li class='relative pl-4 before:absolute before:left-0 before:top-1.5 sm:before:top-2 before:w-1.5 before:h-1.5 before:bg-[var(--primary-color)] before:rounded-full'><strong class='text-theme-text font-semibold'>VN Revolutionary Press Day:</strong> Documented the solemn 101st-anniversary tribute on June 21, 2026.</li><li class='relative pl-4 before:absolute before:left-0 before:top-1.5 sm:before:top-2 before:w-1.5 before:h-1.5 before:bg-[var(--primary-color)] before:rounded-full'><strong class='text-theme-text font-semibold'>Freelance Yearbook Photographer:</strong> Directed artistic youth photo shoots for students across top high schools including Dinh Tien Hoang, Giong Ong To, Vinh Cuu, Bui Thi Xuan...</li></ul>",
      exp_cat2: "Media & Organization",
      exp_desc2: "<ul class='space-y-3'><li class='relative pl-4 before:absolute before:left-0 before:top-1.5 sm:before:top-2 before:w-1.5 before:h-1.5 before:bg-[var(--primary-color)] before:rounded-full'><strong class='text-theme-text font-semibold'>Organizer - CLEANUP 8 VN:</strong> Participated in media support as an organizing committee member for Xanh Dong Nai's campaign.</li><li class='relative pl-4 before:absolute before:left-0 before:top-1.5 sm:before:top-2 before:w-1.5 before:h-1.5 before:bg-[var(--primary-color)] before:rounded-full'><strong class='text-theme-text font-semibold'>UCC 2025 Event (UMT):</strong> Provided media and promotional support for the UMT Marketing Club's major event.</li><li class='relative pl-4 before:absolute before:left-0 before:top-1.5 sm:before:top-2 before:w-1.5 before:h-1.5 before:bg-[var(--primary-color)] before:rounded-full'><strong class='text-theme-text font-semibold'>School Event Media Guest:</strong> Actively supported media for Tam Phuoc Middle School Camp, and Gratitude Ceremonies & Camps at Dinh Tien Hoang High School.</li></ul>",
      exp_cat3: "Volunteer Work",
      exp_desc3: "<ul class='space-y-3'><li class='relative pl-4 before:absolute before:left-0 before:top-1.5 sm:before:top-2 before:w-1.5 before:h-1.5 before:bg-[var(--primary-color)] before:rounded-full'><strong class='text-theme-text font-semibold'>EARTHDAY VIETNAM 2025:</strong> Media volunteer creating content to spread awareness on green living.</li><li class='relative pl-4 before:absolute before:left-0 before:top-1.5 sm:before:top-2 before:w-1.5 before:h-1.5 before:bg-[var(--primary-color)] before:rounded-full'><strong class='text-theme-text font-semibold'>CLEANUP 7 VIETNAM:</strong> On-site volunteer capturing photos and writing promotional articles for environmental protection.</li><li class='relative pl-4 before:absolute before:left-0 before:top-1.5 sm:before:top-2 before:w-1.5 before:h-1.5 before:bg-[var(--primary-color)] before:rounded-full'><strong class='text-theme-text font-semibold'>3rd City-level Green Sunday:</strong> Contributed youth energy to spread the message of protecting local landscapes and environments.</li></ul>",
      footer_quote: "\"Art is how I preserve my youth and tell stories without words.\"",
      footer_copy: "© 2026 Nguyen Ngoc Bao Han. Designed in an elegant, light student theme."
    }
  };

  const typewriterRoles = {
    vi: ['Học Sinh Tiêu Biểu', 'Đam Mê Nhiếp Ảnh', 'Thích Ca Hát', 'Năng Động Sáng Tạo'],
    en: ['Outstanding Student', 'Photography Enthusiast', 'Love Singing', 'Creative & Active']
  };

  let currentLang = 'vi';

  function applyLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) el.innerHTML = translations[lang][key];
    });

    const setBtnActive = (langCode) => {
      const viMb = document.getElementById('lang-vi-mb');
      const enMb = document.getElementById('lang-en-mb');
      const viDk = document.getElementById('lang-vi');
      const enDk = document.getElementById('lang-en');

      if (langCode === 'vi') {
        if(viDk) viDk.className = 'px-3 py-1 rounded-lg bg-theme-primary text-theme-bg font-bold shadow-sm transition-all';
        if(enDk) enDk.className = 'px-3 py-1 rounded-lg text-theme-muted hover:text-theme-text transition-all';
        if(viMb) viMb.className = 'px-6 py-2 rounded-lg bg-theme-primary text-theme-bg font-bold w-1/2 text-center';
        if(enMb) enMb.className = 'px-6 py-2 rounded-lg text-theme-muted w-1/2 text-center';
      } else {
        if(enDk) enDk.className = 'px-3 py-1 rounded-lg bg-theme-primary text-theme-bg font-bold shadow-sm transition-all';
        if(viDk) viDk.className = 'px-3 py-1 rounded-lg text-theme-muted hover:text-theme-text transition-all';
        if(enMb) enMb.className = 'px-6 py-2 rounded-lg bg-theme-primary text-theme-bg font-bold w-1/2 text-center';
        if(viMb) viMb.className = 'px-6 py-2 rounded-lg text-theme-muted w-1/2 text-center';
      }
    };

    setBtnActive(lang);
    resetTypewriter();
  }

  const langToggleBtn = document.getElementById('lang-toggle-btn');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => applyLanguage(currentLang === 'vi' ? 'en' : 'vi'));
  }

  const mobileLangBtn = document.getElementById('lang-toggle-mobile');
  if(mobileLangBtn) {
    mobileLangBtn.addEventListener('click', () => applyLanguage(currentLang === 'vi' ? 'en' : 'vi'));
  }

  let roleIdx = 0, charIdx = 0, isDeleting = false, typeTimer = null;
  const typewriterElem = document.getElementById('typewriter-text');

  function resetTypewriter() {
    if (!typewriterElem) return;
    clearTimeout(typeTimer);
    charIdx = 0;
    isDeleting = false;
    roleIdx = 0;
    typewriterElem.textContent = '';
    typeLoop();
  }

  function typeLoop() {
    if (!typewriterElem) return;
    const currentList = typewriterRoles[currentLang];
    const targetRole = currentList[roleIdx % currentList.length];

    if (isDeleting) {
      typewriterElem.textContent = targetRole.substring(0, charIdx - 1);
      charIdx--;
    } else {
      typewriterElem.textContent = targetRole.substring(0, charIdx + 1);
      charIdx++;
    }

    if (!isDeleting && charIdx === targetRole.length) {
      typeTimer = setTimeout(() => { isDeleting = true; typeLoop(); }, 2000);
      return;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % currentList.length;
    }
    typeTimer = setTimeout(typeLoop, isDeleting ? 30 : 60);
  }

  applyLanguage('vi');

  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect(), x = e.clientX - rect.left, y = e.clientY - rect.top;
        card.style.transform = `perspective(1200px) rotateX(${((y-rect.height/2)/rect.height/2)*-3}deg) rotateY(${((x-rect.width/2)/rect.width/2)*3}deg)`;
      });
      card.addEventListener('mouseleave', () => card.style.transform = 'perspective(1200px) rotateX(0) rotateY(0)');
    });
  }

  const mBtn = document.getElementById('mobile-menu-btn');
  const mClose = document.getElementById('mobile-close-btn');
  const mDrawer = document.getElementById('mobile-drawer');
  const mBack = document.getElementById('mobile-drawer-backdrop');

  function toggleM() {
    if(!mDrawer || !mBack) return;
    mDrawer.classList.toggle('translate-x-full');
    mBack.classList.toggle('opacity-0');
    mBack.classList.toggle('pointer-events-none');
  }

  if (mBtn) mBtn.onclick = toggleM;
  if (mClose) mClose.onclick = toggleM;
  if (mBack) mBack.onclick = toggleM;

  document.querySelectorAll('.mobile-nav-link').forEach(l => {
    l.onclick = toggleM;
  });
});
