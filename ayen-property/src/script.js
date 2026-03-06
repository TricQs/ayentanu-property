// Disable Right Click and Inspect Element
document.addEventListener('contextmenu', event => event.preventDefault());

document.onkeydown = function(e) {
    // Disable F12
    if(e.keyCode == 123) {
        return false;
    }
    // Disable Ctrl+Shift+I (Inspect)
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
        return false;
    }
    // Disable Ctrl+Shift+C (Inspect Element)
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
        return false;
    }
    // Disable Ctrl+Shift+J (Console)
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
        return false;
    }
    // Disable Ctrl+U (View Source)
    if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
        return false;
    }
};

// Mobile Menu Toggle
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

mobileMenu.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = mobileMenu.querySelector('i');
    if(navLinks.classList.contains('active')) {
        icon.classList.replace('bx-menu', 'bx-x');
    } else {
        icon.classList.replace('bx-x', 'bx-menu');
    }
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenu.querySelector('i').classList.replace('bx-x', 'bx-menu');
    });
});

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Scroll to Top Button
const scrollTopBtn = document.getElementById('scroll-top');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('active');
    } else {
        scrollTopBtn.classList.remove('active');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Intersection Observer for Fade-Up Animation
const fadeUpElements = document.querySelectorAll('.fade-up');
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Only animate once
        }
    });
}, observerOptions);

fadeUpElements.forEach(el => observer.observe(el));

// Custom Confirm Dialog
function confirmDialog(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirm-modal');
        const msgEl = document.getElementById('confirm-message');
        const okBtn = document.getElementById('confirm-ok-btn');
        const cancelBtn = document.getElementById('confirm-cancel-btn');

        msgEl.textContent = message;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        const cleanup = () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            okBtn.removeEventListener('click', onOk);
            cancelBtn.removeEventListener('click', onCancel);
        };

        const onOk = () => {
            cleanup();
            resolve(true);
        };

        const onCancel = () => {
            cleanup();
            resolve(false);
        };

        okBtn.addEventListener('click', onOk);
        cancelBtn.addEventListener('click', onCancel);
    });
}

// Custom Alert Dialog
function alertDialog(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirm-modal');
        const msgEl = document.getElementById('confirm-message');
        const okBtn = document.getElementById('confirm-ok-btn');
        const cancelBtn = document.getElementById('confirm-cancel-btn');

        msgEl.textContent = message;
        okBtn.textContent = 'OK';
        okBtn.style.backgroundColor = 'var(--primary-color)';
        okBtn.style.borderColor = 'var(--primary-color)';
        cancelBtn.style.display = 'none';
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        const cleanup = () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            okBtn.removeEventListener('click', onOk);
            
            // Reset styles for confirmDialog
            okBtn.textContent = 'Hapus';
            okBtn.style.backgroundColor = '#f87171';
            okBtn.style.borderColor = '#f87171';
            cancelBtn.style.display = 'block';
        };

        const onOk = () => {
            cleanup();
            resolve(true);
        };

        okBtn.addEventListener('click', onOk);
    });
}

// Property Data Fetching & Rendering
const propertyGrid = document.getElementById('property-grid');
const searchKeyword = document.getElementById('search-keyword');
const filterType = document.getElementById('filter-type');
const filterStatus = document.getElementById('filter-status');
const filterPrice = document.getElementById('filter-price');
const filterArea = document.getElementById('filter-area');
const filterLabel = document.getElementById('filter-label');
const sortOrder = document.getElementById('sort-order');
const resetFilterBtn = document.getElementById('reset-filter');
const mobileFilterBtn = document.getElementById('mobile-filter-btn');
const filterContainer = document.getElementById('filter-container');

let allProperties = [];

// Format currency
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
};

// Fetch data from API
async function fetchProperties() {
    try {
        const response = await fetch('/api/properties');
        if (!response.ok) throw new Error('Network response was not ok');
        allProperties = await response.json();
        renderProperties(allProperties);
        if (localStorage.getItem('adminToken')) {
            renderAdminProperties();
        }
    } catch (error) {
        console.error("Error fetching properties:", error);
        propertyGrid.innerHTML = '<p class="text-secondary">Gagal memuat data properti. Silakan coba lagi nanti.</p>';
    }
}

fetchProperties();

function renderProperties(properties) {
    propertyGrid.innerHTML = '';
    
    if (properties.length === 0) {
        propertyGrid.innerHTML = '<p class="text-secondary">Tidak ada properti yang sesuai dengan filter.</p>';
        return;
    }

    properties.forEach((prop, index) => {
        const card = document.createElement('div');
        card.className = 'property-card fade-up visible';
        
        const imgUrl = prop.gambar || `https://picsum.photos/seed/prop${index}/400/300`;
        const price = prop.harga ? formatRupiah(prop.harga) : 'Harga Hubungi Agen';
        const area = prop.luas_tanah ? `<p class="card-area" style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;"><i class='bx bx-area'></i> ${prop.luas_tanah} m²</p>` : '';
        const labelBadge = prop.label ? `<span class="badge" style="background: var(--gold-main); color: var(--bg-main); font-weight: bold; position: absolute; top: 1rem; right: 1rem; z-index: 2;">${prop.label}</span>` : '';
        
        card.innerHTML = `
            <div style="position: relative;">
                ${labelBadge}
                <img src="${imgUrl}" alt="${prop.judul}" class="card-img" loading="lazy">
            </div>
            <div class="card-body">
                <div class="card-badges">
                    <span class="badge type-badge">${prop.tipe || 'Properti'}</span>
                    <span class="badge status-badge">${prop.status || 'Tersedia'}</span>
                </div>
                <h3 class="card-title">${prop.judul}</h3>
                <p class="card-location"><i class='bx bx-map'></i> ${prop.lokasi || 'Lokasi tidak diketahui'}</p>
                ${area}
                <div class="card-price text-gold">${price}</div>
                <button class="btn-secondary btn-detail" data-id="${prop.id}">Lihat Detail</button>
            </div>
        `;
        propertyGrid.appendChild(card);
    });

    // Add event listeners to new buttons
    document.querySelectorAll('.btn-detail').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            const prop = allProperties.find(p => p.id === id);
            if(prop) openModal(prop);
        });
    });
}

// Filtering Logic
function applyFilters() {
    const keyword = searchKeyword.value.toLowerCase();
    const typeVal = filterType.value;
    const statusVal = filterStatus.value;
    const priceVal = filterPrice.value;
    const areaVal = filterArea.value;
    const labelVal = filterLabel.value;
    const sortVal = sortOrder.value;

    let filtered = allProperties.filter(prop => {
        // Keyword match
        const matchKeyword = !keyword || 
            (prop.judul && prop.judul.toLowerCase().includes(keyword)) || 
            (prop.lokasi && prop.lokasi.toLowerCase().includes(keyword)) || 
            (prop.deskripsi && prop.deskripsi.toLowerCase().includes(keyword));

        // Type match
        const matchType = typeVal === 'all' || prop.tipe === typeVal;
        
        // Status match
        const matchStatus = statusVal === 'all' || prop.status === statusVal;
        
        // Label match
        const matchLabel = labelVal === 'all' || prop.label === labelVal;
        
        // Price match
        let matchPrice = true;
        if (priceVal !== 'all' && prop.harga != null) {
            const [min, max] = priceVal.split('-').map(Number);
            matchPrice = prop.harga >= min && prop.harga <= max;
        } else if (priceVal !== 'all' && prop.harga == null) {
            matchPrice = false; // Exclude properties without price if a specific price range is selected
        }

        // Area match
        let matchArea = true;
        if (areaVal !== 'all' && prop.luas_tanah != null) {
            const [min, max] = areaVal.split('-').map(Number);
            matchArea = prop.luas_tanah >= min && prop.luas_tanah <= max;
        } else if (areaVal !== 'all' && prop.luas_tanah == null) {
            matchArea = false; // Exclude properties without area if a specific area range is selected
        }

        return matchKeyword && matchType && matchStatus && matchLabel && matchPrice && matchArea;
    });

    // Sorting
    if (sortVal === 'terbaru') {
        filtered.sort((a, b) => b.id - a.id);
    } else if (sortVal === 'terlama') {
        filtered.sort((a, b) => a.id - b.id);
    } else if (sortVal === 'harga-tertinggi') {
        filtered.sort((a, b) => (b.harga || 0) - (a.harga || 0));
    } else if (sortVal === 'harga-terendah') {
        filtered.sort((a, b) => {
            if (a.harga == null) return 1;
            if (b.harga == null) return -1;
            return a.harga - b.harga;
        });
    }

    renderProperties(filtered);
}

searchKeyword.addEventListener('input', applyFilters);
filterType.addEventListener('change', applyFilters);
filterStatus.addEventListener('change', applyFilters);
filterPrice.addEventListener('change', applyFilters);
filterArea.addEventListener('change', applyFilters);
filterLabel.addEventListener('change', applyFilters);
sortOrder.addEventListener('change', applyFilters);

resetFilterBtn.addEventListener('click', () => {
    searchKeyword.value = '';
    filterType.value = 'all';
    filterStatus.value = 'all';
    filterPrice.value = 'all';
    filterArea.value = 'all';
    filterLabel.value = 'all';
    sortOrder.value = 'terbaru';
    applyFilters();
});

if (mobileFilterBtn) {
    mobileFilterBtn.addEventListener('click', () => {
        filterContainer.classList.toggle('show');
        const icon = mobileFilterBtn.querySelector('i');
        if (filterContainer.classList.contains('show')) {
            icon.classList.remove('bx-filter-alt');
            icon.classList.add('bx-x');
        } else {
            icon.classList.remove('bx-x');
            icon.classList.add('bx-filter-alt');
        }
    });
}

// Lightbox Logic
const lightboxModal = document.getElementById('lightbox-modal');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.querySelector('.lightbox-prev');
const lightboxNext = document.querySelector('.lightbox-next');

let currentGallery = [];
let currentGalleryIndex = 0;

function openLightbox(index) {
    if (currentGallery.length === 0) return;
    currentGalleryIndex = index;
    lightboxImg.src = currentGallery[currentGalleryIndex];
    lightboxModal.style.display = 'block';
    // Ensure modal is above other elements
    lightboxModal.style.zIndex = '10000';
}

function closeLightbox() {
    lightboxModal.style.display = 'none';
}

function showNextImage() {
    currentGalleryIndex = (currentGalleryIndex + 1) % currentGallery.length;
    lightboxImg.src = currentGallery[currentGalleryIndex];
}

function showPrevImage() {
    currentGalleryIndex = (currentGalleryIndex - 1 + currentGallery.length) % currentGallery.length;
    lightboxImg.src = currentGallery[currentGalleryIndex];
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxNext.addEventListener('click', showNextImage);
lightboxPrev.addEventListener('click', showPrevImage);

window.addEventListener('click', (e) => {
    if (e.target === lightboxModal) {
        closeLightbox();
    }
});

// Modal Logic
const modal = document.getElementById('property-modal');
const closeModalBtn = document.querySelector('.close-modal-btn');

function openModal(prop) {
    document.getElementById('modal-img').src = prop.gambar || `https://picsum.photos/seed/prop/800/600`;
    document.getElementById('modal-type').textContent = prop.tipe || 'Properti';
    document.getElementById('modal-status').textContent = prop.status || 'Tersedia';
    document.getElementById('modal-title').textContent = prop.judul;
    document.querySelector('#modal-location span').textContent = prop.lokasi || 'Lokasi tidak diketahui';
    
    const areaEl = document.getElementById('modal-area');
    if (prop.luas_tanah) {
        areaEl.querySelector('span').textContent = prop.luas_tanah;
        areaEl.style.display = 'block';
    } else {
        areaEl.style.display = 'none';
    }
    
    document.getElementById('modal-price').textContent = prop.harga ? formatRupiah(prop.harga) : 'Harga Hubungi Agen';
    document.getElementById('modal-description').textContent = prop.deskripsi || 'Tidak ada deskripsi tersedia.';
    
    // Render Gallery
    const galleryContainer = document.getElementById('modal-gallery-container');
    const galleryDiv = document.getElementById('modal-gallery');
    galleryDiv.innerHTML = '';
    
    let galeri = [];
    if (prop.galeri) {
        try {
            galeri = typeof prop.galeri === 'string' ? JSON.parse(prop.galeri) : prop.galeri;
        } catch(e) {}
    }
    
    // Combine main image with gallery for lightbox
    currentGallery = [];
    if (prop.gambar) {
        currentGallery.push(prop.gambar);
    }
    
    if (galeri && galeri.length > 0) {
        galleryContainer.style.display = 'block';
        
        galeri.forEach((url) => {
            currentGallery.push(url);
        });
        
        // Render thumbnails (excluding main image to avoid duplication in gallery section, or include all)
        // Let's include all images in the gallery thumbnails for easier navigation
        currentGallery.forEach((url, index) => {
            const img = document.createElement('img');
            img.src = url;
            img.style.height = '120px';
            img.style.borderRadius = '8px';
            img.style.cursor = 'pointer';
            img.style.border = '1px solid var(--glass-border)';
            img.onclick = () => {
                openLightbox(index);
            };
            galleryDiv.appendChild(img);
        });
    } else {
        galleryContainer.style.display = 'none';
        
        // If no gallery, clicking main image can still open lightbox
        document.getElementById('modal-img').onclick = () => {
            if (currentGallery.length > 0) {
                openLightbox(0);
            }
        };
        document.getElementById('modal-img').style.cursor = 'pointer';
    }
    
    // Also allow clicking main image to open lightbox when gallery exists
    if (galeri && galeri.length > 0) {
        document.getElementById('modal-img').onclick = () => {
            openLightbox(0);
        };
        document.getElementById('modal-img').style.cursor = 'pointer';
    }
    
    // Gallery Navigation Logic
    const galleryPrevBtn = document.getElementById('gallery-prev');
    const galleryNextBtn = document.getElementById('gallery-next');
    
    if (galleryPrevBtn && galleryNextBtn && galleryDiv) {
        // Remove old listeners to prevent duplicates
        const newPrevBtn = galleryPrevBtn.cloneNode(true);
        const newNextBtn = galleryNextBtn.cloneNode(true);
        galleryPrevBtn.parentNode.replaceChild(newPrevBtn, galleryPrevBtn);
        galleryNextBtn.parentNode.replaceChild(newNextBtn, galleryNextBtn);
        
        newPrevBtn.addEventListener('click', () => {
            galleryDiv.scrollBy({ left: -200, behavior: 'smooth' });
        });
        
        newNextBtn.addEventListener('click', () => {
            galleryDiv.scrollBy({ left: 200, behavior: 'smooth' });
        });
        
        // Hide buttons if not scrollable
        const checkScroll = () => {
            if (galleryDiv.scrollWidth <= galleryDiv.clientWidth) {
                newPrevBtn.style.display = 'none';
                newNextBtn.style.display = 'none';
            } else {
                newPrevBtn.style.display = 'flex';
                newNextBtn.style.display = 'flex';
            }
        };
        
        // Check after a short delay to allow images to load
        setTimeout(checkScroll, 100);
        window.addEventListener('resize', checkScroll);
    }
    
    // Setup WhatsApp CTA
    const waBtn = document.getElementById('modal-wa-btn');
    const message = `Halo Ayen Tanu, saya tertarik dengan properti "${prop.judul}" yang berlokasi di ${prop.lokasi}. Bisa minta info lebih lanjut?`;
    waBtn.href = `https://wa.me/6282123221572?text=${encodeURIComponent(message)}`;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Contact Form Submission
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');
const submitBtn = document.getElementById('submit-btn');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    submitBtn.textContent = 'Mengirim...';
    submitBtn.disabled = true;

    const formData = new FormData(contactForm);
    const googleFormUrl = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLScOvoIYjC5csSoHK4wGJ4FUZ1CntUE69-WfY8neTB-fEKdxeg/formResponse';

    fetch(googleFormUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
    }).then(() => {
        formMessage.textContent = '✅ Pesan berhasil dikirim!';
        formMessage.className = 'form-message success';
        contactForm.reset();
    }).catch(error => {
        console.error('Error:', error);
        formMessage.textContent = '❌ Terjadi kesalahan. Silakan coba lagi.';
        formMessage.className = 'form-message error';
    }).finally(() => {
        submitBtn.textContent = 'Kirim Pesan';
        submitBtn.disabled = false;
        
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    });
});

// --- ADMIN LOGIC ---
const adminLoginModal = document.getElementById('admin-login-modal');
const closeLoginBtn = document.getElementById('close-login');
const adminLoginForm = document.getElementById('admin-login-form');
const loginMessage = document.getElementById('login-message');
const adminDashboard = document.getElementById('admin-dashboard');
const adminLogoutBtn = document.getElementById('admin-logout-btn');

const propertyFormModal = document.getElementById('property-form-modal');
const closePropFormBtn = document.getElementById('close-prop-form');
const propertyForm = document.getElementById('property-form');
const btnAddProperty = document.getElementById('btn-add-property');

// Check login status on load
if (localStorage.getItem('adminToken')) {
    showAdminDashboard();
}

// Hidden Admin Login Trigger (3 clicks on logo)
const navbarLogo = document.querySelector('.logo');
let logoClickCount = 0;
let logoClickTimer;

navbarLogo.addEventListener('click', (e) => {
    logoClickCount++;
    
    clearTimeout(logoClickTimer);
    logoClickTimer = setTimeout(() => {
        logoClickCount = 0;
    }, 1000); // Reset count after 1 second
    
    if (logoClickCount >= 3) {
        e.preventDefault(); // Prevent scrolling to home on the 3rd click
        logoClickCount = 0; // Reset
        
        if (localStorage.getItem('adminToken')) {
            showAdminDashboard();
            window.scrollTo({ top: adminDashboard.offsetTop, behavior: 'smooth' });
        } else {
            adminLoginModal.style.display = 'block';
        }
    }
});

closeLoginBtn.addEventListener('click', () => {
    adminLoginModal.style.display = 'none';
});

adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('adminToken', data.token);
            adminLoginModal.style.display = 'none';
            adminLoginForm.reset();
            showAdminDashboard();
            window.scrollTo({ top: adminDashboard.offsetTop, behavior: 'smooth' });
        } else {
            loginMessage.textContent = '❌ ' + data.error;
            loginMessage.style.display = 'block';
        }
    } catch (err) {
        loginMessage.textContent = '❌ Terjadi kesalahan.';
        loginMessage.style.display = 'block';
    }
});

adminLogoutBtn.addEventListener('click', async () => {
    localStorage.removeItem('adminToken');
    adminDashboard.style.display = 'none';
    await alertDialog('Berhasil logout.');
});

function showAdminDashboard() {
    adminDashboard.style.display = 'block';
    renderAdminProperties();
}

const adminSearch = document.getElementById('admin-search');
adminSearch.addEventListener('input', (e) => {
    renderAdminProperties(e.target.value);
});

function renderAdminProperties(searchTerm = '') {
    const tbody = document.getElementById('admin-property-list');
    tbody.innerHTML = '';
    
    const term = searchTerm.toLowerCase();
    const filtered = allProperties.filter(prop => {
        return prop.judul.toLowerCase().includes(term) ||
               prop.tipe.toLowerCase().includes(term) ||
               prop.harga.toString().includes(term);
    });
    
    filtered.forEach(prop => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${prop.id}</td>
            <td><img src="${prop.gambar || 'https://picsum.photos/60/40'}" alt="img"></td>
            <td>${prop.judul}</td>
            <td>${prop.tipe}</td>
            <td>${prop.status}</td>
            <td>${formatRupiah(prop.harga)}</td>
            <td class="action-btns">
                <button class="btn-icon edit" data-id="${prop.id}"><i class='bx bx-edit'></i></button>
                <button class="btn-icon delete" data-id="${prop.id}"><i class='bx bx-trash'></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Event delegation for admin table buttons
document.getElementById('admin-property-list').addEventListener('click', async (e) => {
    console.log('Table clicked', e.target);
    let target = e.target;
    
    // Ensure target is an element
    if (target.nodeType !== 1) {
        target = target.parentElement;
    }

    if (!target || !target.closest) return;

    const editBtn = target.closest('.btn-icon.edit');
    const deleteBtn = target.closest('.btn-icon.delete');

    if (editBtn) {
        console.log('Edit button clicked', editBtn);
        e.preventDefault();
        const id = parseInt(editBtn.getAttribute('data-id'));
        const prop = allProperties.find(p => p.id === id);
        if (prop) openPropertyForm(prop);
        return;
    }

    if (deleteBtn) {
        console.log('Delete button clicked', deleteBtn);
        e.preventDefault();
        const id = deleteBtn.getAttribute('data-id');
        
        const isConfirmed = await confirmDialog('Yakin ingin menghapus properti ini?');
        
        if (isConfirmed) {
            console.log('User confirmed deletion for id:', id);
            const originalHtml = deleteBtn.innerHTML;
            deleteBtn.disabled = true;
            deleteBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i>';

            try {
                const token = localStorage.getItem('adminToken');
                const res = await fetch(`/api/properties/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    console.log('Delete successful');
                    await fetchProperties(); // Refresh data
                    await alertDialog('Properti berhasil dihapus!');
                } else {
                    console.log('Delete failed with status:', res.status);
                    const data = await res.json().catch(() => ({}));
                    await alertDialog('Gagal menghapus properti: ' + (data.error || 'Server error'));
                    deleteBtn.disabled = false;
                    deleteBtn.innerHTML = originalHtml;
                }
            } catch (err) {
                console.error('Delete error:', err);
                await alertDialog('Terjadi kesalahan saat menghapus properti.');
                deleteBtn.disabled = false;
                deleteBtn.innerHTML = originalHtml;
            }
        } else {
            console.log('User cancelled deletion');
        }
    }
});

btnAddProperty.addEventListener('click', () => {
    openPropertyForm();
});

closePropFormBtn.addEventListener('click', () => {
    propertyFormModal.style.display = 'none';
});

function openPropertyForm(prop = null) {
    propertyForm.reset();
    const title = document.getElementById('prop-form-title');
    const previewContainer = document.getElementById('upload-preview');
    const previewImg = document.getElementById('preview-img');
    const uploadStatus = document.getElementById('upload-status');
    const galeriPreviewContainer = document.getElementById('galeri-preview');
    const galeriUploadStatus = document.getElementById('galeri-upload-status');
    
    previewContainer.style.display = 'none';
    uploadStatus.textContent = '';
    galeriPreviewContainer.innerHTML = '';
    galeriUploadStatus.textContent = '';
    
    if (prop) {
        title.innerHTML = `Edit <span class="text-gold">Properti</span>`;
        document.getElementById('prop-id').value = prop.id;
        document.getElementById('prop-judul').value = prop.judul;
        document.getElementById('prop-tipe').value = prop.tipe;
        document.getElementById('prop-status').value = prop.status;
        document.getElementById('prop-label').value = prop.label || '';
        document.getElementById('prop-lokasi').value = prop.lokasi;
        
        // Format the price with dots when editing
        document.getElementById('prop-harga').value = prop.harga ? prop.harga.toLocaleString('id-ID') : '';
        document.getElementById('prop-luas-tanah').value = prop.luas_tanah || '';
        
        document.getElementById('prop-gambar-url').value = prop.gambar;
        document.getElementById('prop-galeri-urls').value = prop.galeri || '[]';
        document.getElementById('prop-deskripsi').value = prop.deskripsi;
        
        // Make file input optional when editing
        document.getElementById('prop-gambar').removeAttribute('required');
        
        // Show delete button
        document.getElementById('btn-delete-property').style.display = 'block';
        
        if (prop.gambar) {
            previewImg.src = prop.gambar;
            previewContainer.style.display = 'block';
        }
        
        if (prop.galeri) {
            try {
                const galeri = typeof prop.galeri === 'string' ? JSON.parse(prop.galeri) : prop.galeri;
                galeri.forEach(url => {
                    const img = document.createElement('img');
                    img.src = url;
                    img.style.height = '100px';
                    img.style.borderRadius = '5px';
                    img.style.border = '1px solid var(--glass-border)';
                    galeriPreviewContainer.appendChild(img);
                });
            } catch(e) {}
        }
    } else {
        title.innerHTML = `Tambah <span class="text-gold">Properti</span>`;
        document.getElementById('prop-id').value = '';
        document.getElementById('prop-label').value = '';
        document.getElementById('prop-luas-tanah').value = '';
        document.getElementById('prop-gambar-url').value = '';
        document.getElementById('prop-galeri-urls').value = '[]';
        document.getElementById('prop-gambar').setAttribute('required', 'true');
        
        // Hide delete button
        document.getElementById('btn-delete-property').style.display = 'none';
    }
    
    propertyFormModal.style.display = 'block';
}

// Handle Image Upload to ImgBB
const propGambarInput = document.getElementById('prop-gambar');
const propGambarUrlInput = document.getElementById('prop-gambar-url');
const previewContainer = document.getElementById('upload-preview');
const previewImg = document.getElementById('preview-img');
const uploadStatus = document.getElementById('upload-status');
const propSubmitBtn = propertyForm.querySelector('button[type="submit"]');

propGambarInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewContainer.style.display = 'block';
    };
    reader.readAsDataURL(file);

    // Upload to ImgBB
    uploadStatus.textContent = 'Mengunggah gambar...';
    uploadStatus.style.color = 'var(--gold-main)';
    propSubmitBtn.disabled = true;

    const formData = new FormData();
    formData.append('image', file);

    // Use environment variable for API key
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    
    if (!apiKey || apiKey === 'YOUR_IMGBB_API_KEY' || apiKey === 'your_imgbb_api_key_here') {
        uploadStatus.textContent = '❌ API Key ImgBB belum dikonfigurasi di .env';
        uploadStatus.style.color = '#ff4444';
        propSubmitBtn.disabled = false;
        return;
    }

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            propGambarUrlInput.value = data.data.url;
            uploadStatus.textContent = '✅ Gambar berhasil diunggah!';
            uploadStatus.style.color = '#25D366';
        } else {
            throw new Error(data.error?.message || 'Upload failed');
        }
    } catch (error) {
        console.error('Upload error:', error);
        uploadStatus.textContent = '❌ Gagal mengunggah gambar. Silakan coba lagi.';
        uploadStatus.style.color = '#ff4444';
        propGambarUrlInput.value = '';
    } finally {
        propSubmitBtn.disabled = false;
    }
});

// Handle Gallery Upload to ImgBB
const propGaleriInput = document.getElementById('prop-galeri');
const propGaleriUrlsInput = document.getElementById('prop-galeri-urls');
const galeriPreviewContainer = document.getElementById('galeri-preview');
const galeriUploadStatus = document.getElementById('galeri-upload-status');

propGaleriInput.addEventListener('change', async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    galeriUploadStatus.textContent = `Mengunggah ${files.length} gambar...`;
    galeriUploadStatus.style.color = 'var(--gold-main)';
    propSubmitBtn.disabled = true;
    
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    if (!apiKey || apiKey === 'YOUR_IMGBB_API_KEY' || apiKey === 'your_imgbb_api_key_here') {
        galeriUploadStatus.textContent = '❌ API Key ImgBB belum dikonfigurasi di .env';
        galeriUploadStatus.style.color = '#ff4444';
        propSubmitBtn.disabled = false;
        return;
    }

    let uploadedUrls = [];
    // Keep existing gallery if editing
    if (propGaleriUrlsInput.value) {
        try {
            uploadedUrls = JSON.parse(propGaleriUrlsInput.value);
        } catch(e) {}
    }

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Local preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.height = '100px';
            img.style.borderRadius = '5px';
            img.style.border = '1px solid var(--glass-border)';
            galeriPreviewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);

        // Upload
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                uploadedUrls.push(data.data.url);
                successCount++;
            } else {
                failCount++;
            }
        } catch (error) {
            failCount++;
        }
        
        galeriUploadStatus.textContent = `Mengunggah: ${i + 1}/${files.length}...`;
    }

    propGaleriUrlsInput.value = JSON.stringify(uploadedUrls);
    
    if (failCount === 0) {
        galeriUploadStatus.textContent = `✅ ${successCount} gambar berhasil diunggah!`;
        galeriUploadStatus.style.color = '#25D366';
    } else {
        galeriUploadStatus.textContent = `⚠️ ${successCount} berhasil, ${failCount} gagal.`;
        galeriUploadStatus.style.color = '#ff4444';
    }
    
    propSubmitBtn.disabled = false;
});

// Handle Price Auto-Formatting
const propHargaInput = document.getElementById('prop-harga');

propHargaInput.addEventListener('input', function(e) {
    // Remove any non-digit characters
    let value = this.value.replace(/\D/g, '');
    
    // Format with dots
    if (value !== '') {
        value = parseInt(value, 10).toLocaleString('id-ID');
    }
    
    this.value = value;
});

propertyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('prop-id').value;
    
    // Remove dots before parsing to int
    const rawHarga = document.getElementById('prop-harga').value.replace(/\./g, '');
    
    const propData = {
        judul: document.getElementById('prop-judul').value,
        tipe: document.getElementById('prop-tipe').value,
        status: document.getElementById('prop-status').value,
        label: document.getElementById('prop-label').value || null,
        lokasi: document.getElementById('prop-lokasi').value,
        harga: parseInt(rawHarga, 10),
        luas_tanah: document.getElementById('prop-luas-tanah').value ? parseInt(document.getElementById('prop-luas-tanah').value, 10) : null,
        gambar: document.getElementById('prop-gambar-url').value,
        deskripsi: document.getElementById('prop-deskripsi').value,
        galeri: document.getElementById('prop-galeri-urls').value ? JSON.parse(document.getElementById('prop-galeri-urls').value) : []
    };

    const token = localStorage.getItem('adminToken');
    const url = id ? `/api/properties/${id}` : '/api/properties';
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(propData)
        });

        if (res.ok) {
            propertyFormModal.style.display = 'none';
            await fetchProperties(); // Refresh data
            await alertDialog('Properti berhasil disimpan!');
        } else {
            await alertDialog('Gagal menyimpan properti. Sesi mungkin telah berakhir.');
        }
    } catch (err) {
        console.error(err);
        await alertDialog('Terjadi kesalahan.');
    }
});



// Handle delete button inside the form
document.getElementById('btn-delete-property').addEventListener('click', async (e) => {
    e.preventDefault();
    const id = document.getElementById('prop-id').value;
    if (!id) return;
    
    const isConfirmed = await confirmDialog('Yakin ingin menghapus properti ini?\n\nCatatan: Gambar yang sudah diunggah ke ImgBB tidak akan terhapus secara otomatis dari server ImgBB. Anda harus menghapusnya secara manual melalui akun ImgBB Anda jika diperlukan.');
    
    if (isConfirmed) {
        
        const btn = document.getElementById('btn-delete-property');
        const originalText = btn.textContent;
        btn.textContent = 'Menghapus...';
        btn.disabled = true;

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`/api/properties/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                propertyFormModal.style.display = 'none';
                await fetchProperties(); // Refresh data
                await alertDialog('Properti berhasil dihapus!');
            } else {
                await alertDialog('Gagal menghapus properti.');
            }
        } catch (err) {
            console.error(err);
            await alertDialog('Terjadi kesalahan.');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }
});
