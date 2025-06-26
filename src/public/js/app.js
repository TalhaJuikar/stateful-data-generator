document.addEventListener('DOMContentLoaded', function() {
    console.log('Document ready - initializing application');
    
    // Initialize the page based on its path
    const path = window.location.pathname;
    console.log('Current path:', path);
    
    if (path === '/' || path === '') {
        console.log('Initializing dashboard');
        initDashboard();
    } else if (path === '/stats') {
        console.log('Initializing stats page');
        initStats();
    } else if (path === '/generator') {
        console.log('Initializing generator page');
        initGenerator();
    }
    
    // Form submission for adding new data
    const addDataForm = document.getElementById('addDataForm');
    console.log('Add data form found:', !!addDataForm);
    
    if (addDataForm) {
        addDataForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value
            };
            console.log('Form data:', formData);
            
            fetch('/api/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('addDataModal'));
                modal.hide();
                window.location.reload();
            })
            .catch(error => console.error('Error adding data:', error));
        });
    }
    
    // Delete data functionality
    console.log('Setting up delete functionality');
    document.querySelectorAll('.delete-data').forEach(button => {
        console.log('Found delete button:', button);
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            console.log('Delete clicked for ID:', id);
            
            if (confirm('Are you sure you want to delete this item?')) {
                fetch(`/api/data/${id}`, {
                    method: 'DELETE'
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Delete successful:', data);
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error deleting data:', error);
                    alert('Failed to delete the item. Please try again.');
                });
            }
        });
    });
    
    // View data modal
    console.log('Setting up view functionality');
    document.querySelectorAll('.view-data').forEach(button => {
        console.log('Found view button:', button);
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            console.log('View clicked for ID:', id);
            
            fetch(`/api/data/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch data details');
                }
                return response.json();
            })
            .then(data => {
                console.log('Fetched data details:', data);
                const content = document.getElementById('viewDataContent');
                content.innerHTML = `
                    <div class="mb-3">
                        <h6>Name</h6>
                        <p>${data.name}</p>
                    </div>
                    <div class="mb-3">
                        <h6>Email</h6>
                        <p>${data.email}</p>
                    </div>
                    <div class="mb-3">
                        <h6>Message</h6>
                        <p>${data.message}</p>
                    </div>
                    <div class="mb-3">
                        <h6>Created At</h6>
                        <p>${new Date(data.createdAt).toLocaleString()}</p>
                    </div>
                    <div class="mb-3">
                        <h6>ID</h6>
                        <p>${data._id}</p>
                    </div>
                `;
            })
            .catch(error => {
                console.error('Error fetching data details:', error);
                const content = document.getElementById('viewDataContent');
                content.innerHTML = `<div class="alert alert-danger">Failed to load data details. Error: ${error.message}</div>`;
            });
        });
    });
});

// Dashboard initialization
function initDashboard() {
    console.log('Setting up dashboard functionality');
    
    // Set up charts and statistics if they exist
    setupCharts();
    
    // Setup multi-select functionality
    setupMultiSelect();
    
    // Setup Delete All functionality
    setupDeleteAll();
    
    // Setup entries limit selector
    setupEntriesLimitSelector();
    
    // Setup individual delete buttons
    setupDeleteButtons();
}

function setupDeleteButtons() {
    document.querySelectorAll('.delete-data').forEach(button => {
        console.log('Setting up delete button:', button);
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            console.log('Delete clicked for ID:', id);
            
            if (confirm('Are you sure you want to delete this item?')) {
                fetch(`/api/data/${id}`, {
                    method: 'DELETE'
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Delete successful:', data);
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error deleting data:', error);
                    alert('Failed to delete the item. Please try again.');
                });
            }
        });
    });
}

function setupCharts() {
    // Data creation chart
    const dataCreationCtx = document.getElementById('dataCreationChart');
    if (dataCreationCtx) {
        fetch('/api/data')
        .then(response => response.json())
        .then(data => {
            // Group data by date
            const groupedData = {};
            data.forEach(item => {
                const date = new Date(item.createdAt).toLocaleDateString();
                if (!groupedData[date]) {
                    groupedData[date] = 0;
                }
                groupedData[date]++;
            });
            
            // Prepare chart data
            const labels = Object.keys(groupedData);
            const counts = Object.values(groupedData);
            
            new Chart(dataCreationCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Records Created',
                        data: counts,
                        backgroundColor: 'rgba(13, 110, 253, 0.2)',
                        borderColor: 'rgba(13, 110, 253, 1)',
                        borderWidth: 2,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching data for chart:', error));
    }
}

// Stats page initialization
function initStats() {
    fetch('/api/data')
    .then(response => response.json())
    .then(data => {
        if (data.length === 0) return;
        
        // Growth chart
        const growthCtx = document.getElementById('growthChart');
        if (growthCtx) {
            // Create cumulative data over time
            const sortedData = [...data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            const dates = sortedData.map(item => new Date(item.createdAt).toLocaleDateString());
            const uniqueDates = [...new Set(dates)];
            
            // Create cumulative count
            let cumulativeCount = 0;
            const cumulativeCounts = uniqueDates.map(date => {
                const count = dates.filter(d => d === date).length;
                cumulativeCount += count;
                return cumulativeCount;
            });
            
            new Chart(growthCtx, {
                type: 'line',
                data: {
                    labels: uniqueDates,
                    datasets: [{
                        label: 'Cumulative Records',
                        data: cumulativeCounts,
                        backgroundColor: 'rgba(40, 167, 69, 0.2)',
                        borderColor: 'rgba(40, 167, 69, 1)',
                        borderWidth: 2,
                        tension: 0.1,
                        fill: true
                    }]
                },
                options: {
                    responsive: true
                }
            });
        }
        
        // Domain chart
        const domainCtx = document.getElementById('domainChart');
        if (domainCtx) {
            // Extract domains from emails
            const domains = data.map(item => {
                const email = item.email;
                return email.substring(email.lastIndexOf('@') + 1);
            });
            
            // Count domains
            const domainCount = {};
            domains.forEach(domain => {
                if (!domainCount[domain]) {
                    domainCount[domain] = 0;
                }
                domainCount[domain]++;
            });
            
            // Get top 5 domains
            const topDomains = Object.keys(domainCount)
                .sort((a, b) => domainCount[b] - domainCount[a])
                .slice(0, 5);
                
            const topDomainCounts = topDomains.map(domain => domainCount[domain]);
            
            new Chart(domainCtx, {
                type: 'pie',
                data: {
                    labels: topDomains,
                    datasets: [{
                        data: topDomainCounts,
                        backgroundColor: [
                            'rgba(13, 110, 253, 0.7)',
                            'rgba(220, 53, 69, 0.7)',
                            'rgba(40, 167, 69, 0.7)',
                            'rgba(255, 193, 7, 0.7)',
                            'rgba(108, 117, 125, 0.7)'
                        ]
                    }]
                },
                options: {
                    responsive: true
                }
            });
        }
        
        // Message length chart
        const msgLengthCtx = document.getElementById('messageLengthChart');
        if (msgLengthCtx) {
            const messageLengths = data.map(item => item.message.length);
            
            // Group by length ranges
            const ranges = ['0-50', '51-100', '101-200', '201+'];
            const rangeCounts = [
                messageLengths.filter(len => len <= 50).length,
                messageLengths.filter(len => len > 50 && len <= 100).length,
                messageLengths.filter(len => len > 100 && len <= 200).length,
                messageLengths.filter(len => len > 200).length
            ];
            
            new Chart(msgLengthCtx, {
                type: 'bar',
                data: {
                    labels: ranges,
                    datasets: [{
                        label: 'Message Length Distribution',
                        data: rangeCounts,
                        backgroundColor: 'rgba(13, 110, 253, 0.7)'
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }
                    }
                }
            });
        }
    })
    .catch(error => console.error('Error fetching data for stats:', error));
}

// Generator page initialization
function initGenerator() {
    console.log('Initializing generator page');
    const dataCountSlider = document.getElementById('dataCount');
    const dataCountValue = document.getElementById('dataCountValue');
    const generateForm = document.getElementById('generateDataForm');
    const progressBar = document.getElementById('generationProgress');
    const resultAlert = document.getElementById('generationResult');
    
    if (dataCountSlider && dataCountValue) {
        console.log('Setting up data count slider');
        // Set initial value
        dataCountValue.textContent = dataCountSlider.value;
        
        // Add event listener
        dataCountSlider.addEventListener('input', function() {
            console.log('Slider value changed to:', this.value);
            dataCountValue.textContent = this.value;
        });
    }
    
    if (generateForm) {
        generateForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const count = parseInt(document.getElementById('dataCount').value);
            const generateButton = document.getElementById('generateButton');
            
            // Disable the button and show progress
            generateButton.disabled = true;
            generateButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating...';
            progressBar.style.width = '0%';
            progressBar.textContent = '0%';
            resultAlert.classList.add('d-none');
            
            // Generate data with progress updates
            let generated = 0;
            const batchSize = Math.max(1, Math.floor(count / 10)); // Generate in batches for progress updates
            
            function generateBatch() {
                const batchCount = Math.min(batchSize, count - generated);
                
                fetch('/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ count: batchCount })
                })
                .then(response => response.json())
                .then(data => {
                    generated += batchCount;
                    const progress = Math.round((generated / count) * 100);
                    
                    progressBar.style.width = progress + '%';
                    progressBar.textContent = progress + '%';
                    
                    if (generated < count) {
                        // Continue generating
                        setTimeout(generateBatch, 500);
                    } else {
                        // Finished
                        generateButton.disabled = false;
                        generateButton.textContent = 'Generate Data';
                        
                        resultAlert.classList.remove('d-none');
                        resultAlert.classList.remove('alert-info');
                        resultAlert.classList.add('alert-success');
                        resultAlert.innerHTML = `<strong>Success!</strong> Generated ${count} records successfully.`;
                        
                        // Add to history
                        updateGenerationHistory(count);
                    }
                })
                .catch(error => {
                    console.error('Error generating data:', error);
                    generateButton.disabled = false;
                    generateButton.textContent = 'Generate Data';
                    
                    resultAlert.classList.remove('d-none');
                    resultAlert.classList.remove('alert-info');
                    resultAlert.classList.add('alert-danger');
                    resultAlert.innerHTML = '<strong>Error!</strong> Failed to generate data. Please try again.';
                });
            }
            
            // Start generation
            generateBatch();
        });
    }
    
    // Clear history button
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', function() {
            localStorage.removeItem('generationHistory');
            updateGenerationHistoryUI();
        });
    }
    
    // Initialize history UI
    updateGenerationHistoryUI();
}

function updateGenerationHistory(count) {
    const now = new Date();
    const historyItem = {
        count,
        timestamp: now.toISOString(),
        formattedTime: now.toLocaleString()
    };
    
    // Get existing history
    let history = JSON.parse(localStorage.getItem('generationHistory') || '[]');
    
    // Add new item
    history.unshift(historyItem);
    
    // Keep only the last 10 items
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    
    // Save back to localStorage
    localStorage.setItem('generationHistory', JSON.stringify(history));
    
    // Update UI
    updateGenerationHistoryUI();
}

function updateGenerationHistoryUI() {
    const historyElement = document.getElementById('generationHistory');
    if (!historyElement) return;
    
    const history = JSON.parse(localStorage.getItem('generationHistory') || '[]');
    
    if (history.length === 0) {
        historyElement.innerHTML = `
            <li class="list-group-item">
                No generation history available
            </li>
        `;
        return;
    }
    
    historyElement.innerHTML = history.map(item => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <div>
                <strong>Generated ${item.count} records</strong>
                <br>
                <small class="text-muted">${item.formattedTime}</small>
            </div>
            <span class="badge bg-primary rounded-pill">${item.count}</span>
        </li>
    `).join('');
}

function setupMultiSelect() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const entryCheckboxes = document.querySelectorAll('.entry-checkbox');
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    
    if (!selectAllCheckbox || !deleteSelectedBtn) return;
    
    // Update Delete Selected button visibility based on selections
    function updateDeleteSelectedButton() {
        const selectedCount = document.querySelectorAll('.entry-checkbox:checked').length;
        if (selectedCount > 0) {
            deleteSelectedBtn.classList.remove('d-none');
            deleteSelectedBtn.textContent = `Delete Selected (${selectedCount})`;
        } else {
            deleteSelectedBtn.classList.add('d-none');
        }
    }
    
    // Handle "Select All" checkbox
    selectAllCheckbox.addEventListener('change', function() {
        entryCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
        updateDeleteSelectedButton();
    });
    
    // Handle individual checkboxes
    entryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Update "Select All" checkbox state
            const allChecked = document.querySelectorAll('.entry-checkbox').length === 
                               document.querySelectorAll('.entry-checkbox:checked').length;
            selectAllCheckbox.checked = allChecked;
            
            updateDeleteSelectedButton();
        });
    });
    
    // Handle Delete Selected button
    deleteSelectedBtn.addEventListener('click', function() {
        const selectedIds = Array.from(document.querySelectorAll('.entry-checkbox:checked'))
                               .map(checkbox => checkbox.value);
        
        if (selectedIds.length === 0) return;
        
        // Update the count in the modal
        document.getElementById('selectedItemsCount').textContent = selectedIds.length;
        
        // Show confirmation modal
        const deleteSelectedModal = new bootstrap.Modal(document.getElementById('deleteSelectedModal'));
        deleteSelectedModal.show();
        
        // Handle confirmation
        document.getElementById('confirmDeleteSelectedBtn').onclick = function() {
            fetch('/api/data/delete-multiple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids: selectedIds })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Delete multiple successful:', data);
                deleteSelectedModal.hide();
                window.location.reload();
            })
            .catch(error => {
                console.error('Error deleting multiple entries:', error);
                alert('Failed to delete the selected items. Please try again.');
            });
        };
    });
}

function setupDeleteAll() {
    const confirmDeleteAllBtn = document.getElementById('confirmDeleteAllBtn');
    if (confirmDeleteAllBtn) {
        confirmDeleteAllBtn.addEventListener('click', function() {
            fetch('/api/data', {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                console.log('Delete all successful:', data);
                const deleteAllModal = bootstrap.Modal.getInstance(document.getElementById('deleteAllModal'));
                if (deleteAllModal) {
                    deleteAllModal.hide();
                }
                window.location.reload();
            })
            .catch(error => {
                console.error('Error deleting all entries:', error);
                alert('Failed to delete all items. Please try again.');
            });
        });
    }
}

function setupEntriesLimitSelector() {
    const entriesLimitSelect = document.getElementById('entriesLimit');
    if (entriesLimitSelect) {
        entriesLimitSelect.addEventListener('change', function() {
            const limit = this.value;
            console.log('Changing entries limit to:', limit);
            
            // Get current page from URL or default to 1
            const urlParams = new URLSearchParams(window.location.search);
            const currentPage = urlParams.get('page') || 1;
            
            // Navigate to new URL with both limit and page parameters
            window.location.href = `/?limit=${limit}&page=${currentPage}`;
        });
    }
}
