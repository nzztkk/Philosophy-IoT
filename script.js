document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const splashScreen = document.getElementById('splash');
    const startButton = document.getElementById('start-btn');
    const mainContainer = document.querySelector('.container');
    const slidesNavigation = document.getElementById('slide-nav');
    const slidesContainer = document.getElementById('slides');
    
    // Initialize presentation
    startButton.addEventListener('click', initializePresentation);

    async function initializePresentation() {
        // Hide splash screen with fade out effect
        splashScreen.style.opacity = '0';
        
        setTimeout(() => {
            splashScreen.style.display = 'none';
            loadAndDisplayPresentation();
        }, 800);
    }

    async function loadAndDisplayPresentation() {
        try {
            // Load slides data
            const response = await fetch('./data/slides.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const slidesData = await response.json();
            
            // Build presentation
            buildPresentation(slidesData);
            mainContainer.classList.add('visible');
            
            // Show first slide
            displaySlide(slidesData[0].id);
            
            // Initialize image modal functionality
            setupImageModal();

        } catch (error) {
            console.error('Presentation loading failed:', error);
            displayErrorScreen();
        }
    }

    function buildPresentation(slides) {
        // Create navigation and slides
        slides.forEach(slide => {
            createNavigationItem(slide);
            createSlideElement(slide);
        });

        // Setup navigation event listeners
        slidesNavigation.addEventListener('click', handleNavigationClick);
    }

    function createNavigationItem(slide) {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        
        link.href = `#slide-${slide.id}`;
        link.textContent = slide.title;
        link.dataset.id = slide.id;
        
        listItem.appendChild(link);
        slidesNavigation.appendChild(listItem);
    }

    function createSlideElement(slide) {
        const slideElement = document.createElement('div');
        slideElement.className = `slide ${slide.theme || ''}`;
        slideElement.id = `slide-${slide.id}`;
        
        // Format content with proper line breaks
        const formattedContent = slide.content.replace(/<br>/g, '<br>');
        
        // Add media content if available
        const mediaContent = createMediaContent(slide);
        
        slideElement.innerHTML = `
            <div class="slide-header">
                <h1>${slide.title}</h1>
            </div>
            <div class="slide-content">
                <p>${formattedContent}</p>
                ${mediaContent}
            </div>
        `;
        
        slidesContainer.appendChild(slideElement);
    }

    function createMediaContent(slide) {
        if (!slide.media) return '';
        
        if (slide.media.type === 'image') {
            return `
                <div class="media-container">
                    <img src="${slide.media.src}" alt="${slide.title}" 
                         class="slide-image" data-id="${slide.id}">
                </div>
            `;
        }
        
        if (slide.media.type === 'video') {
            return `
                <div class="media-container">
                    <div class="video-wrapper">
                        <iframe src="${slide.media.src}" 
                                allow="accelerometer; autopl000000play; encrypted-media; gyroscope" 
                                allowfullscreen></iframe>
                    </div>
                </div>
            `;
        }
        
        return '';
    }

    function handleNavigationClick(event) {
        if (event.target.tagName === 'A') {
            event.preventDefault();
            const slideId = event.target.dataset.id;
            displaySlide(slideId);
        }
    }

    function displaySlide(slideId) {
        // Hide all slides
        document.querySelectorAll('.slide').forEach(slide => {
            slide.classList.remove('active');
        });

        // Update active navigation item
        document.querySelectorAll('.sidebar a').forEach(link => {
            link.classList.remove('active');
        });

        // Show selected slide
        const targetSlide = document.getElementById(`slide-${slideId}`);
        if (targetSlide) {
            targetSlide.classList.add('active');
            document.querySelector(`.sidebar a[data-id="${slideId}"]`).classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function setupImageModal() {
        // Click handler for images
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('slide-image')) {
                openImageModal(event.target.src, event.target.alt);
            }
            
            // Close modal when clicking overlay or close button
            if (event.target.id === 'modal-overlay' || event.target.id === 'close-modal') {
                closeImageModal();
            }
        });
    }

    function openImageModal(imageSrc, imageAlt) {
        // Create modal overlay
        const modalHTML = `
            <div id="modal-overlay">
                <div class="modal-content">
                    <button id="close-modal">&times;</button>
                    <img src="${imageSrc}" alt="${imageAlt}" class="modal-image">
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    function closeImageModal() {
        const modal = document.getElementById('modal-overlay');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    function displayErrorScreen() {
        mainContainer.innerHTML = `
            <div class="slide active">
                <div class="slide-header">
                    <h1>Presentation Error</h1>
                </div>
                <div class="slide-content">
                    <p>Failed to load the presentation. Please check:</p>
                    <ul>
                        <li>Internet connection</li>
                        <li>data/slides.json file exists</li>
                        <li>JSON format is valid</li>
                    </ul>
                </div>
            </div>
        `;
        
        mainContainer.classList.add('visible');
    }
});