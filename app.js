const API_BASE_URL = 'http://localhost:8000';

let allProjects = [];
let charts = {};
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    loadDashboardData();
    setupPredictionForm();
    setupProjectsFilters();
});

function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSection = btn.dataset.section;

            navButtons.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
        });
    });
}

async function loadDashboardData() {
    try {
        await Promise.all([
            loadStatistics(),
            loadProjects(),
            loadModelInfo()
        ]);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Failed to load dashboard data. Make sure the API server is running.');
    }
}

async function loadStatistics() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        const stats = await response.json();

        document.getElementById('total-projects').textContent = stats.total_projects;
        document.getElementById('completed-projects').textContent = stats.completed_projects;
        document.getElementById('in-progress-projects').textContent = stats.in_progress_projects;
        document.getElementById('total-cost').textContent = formatCurrency(stats.total_cost);

        createCharts(stats);
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/projects`);
        const data = await response.json();
        allProjects = data.projects;

        renderProjectsTable(allProjects);
    } catch (error) {
        console.error('Error loading projects:', error);
        document.getElementById('projectsTableBody').innerHTML =
            '<tr><td colspan="8" class="loading-cell">Failed to load projects</td></tr>';
    }
}

async function loadModelInfo() {
    try {
        const response = await fetch(`${API_BASE_URL}/model-info`);
        const modelInfo = await response.json();

        document.getElementById('delayModelType').textContent = modelInfo.delay_model.type;
        document.getElementById('delayMAE').textContent = modelInfo.delay_model.mae.toFixed(3);
        document.getElementById('delayR2').textContent = modelInfo.delay_model.r2_score.toFixed(3);
        document.getElementById('delayEstimators').textContent = modelInfo.delay_model.n_estimators;

        document.getElementById('bottleneckModelType').textContent = modelInfo.bottleneck_model.type;
        document.getElementById('bottleneckAccuracy').textContent =
            (modelInfo.bottleneck_model.accuracy * 100).toFixed(1) + '%';
        document.getElementById('bottleneckEstimators').textContent = modelInfo.bottleneck_model.n_estimators;

        const delayFeatures = modelInfo.delay_model.features.slice(0, 10);
        const bottleneckFeatures = modelInfo.bottleneck_model.features.slice(0, 10);

        document.getElementById('delayFeatures').innerHTML = delayFeatures
            .map(f => `<span class="feature-tag">${f}</span>`).join('');
        document.getElementById('bottleneckFeatures').innerHTML = bottleneckFeatures
            .map(f => `<span class="feature-tag">${f}</span>`).join('');
    } catch (error) {
        console.error('Error loading model info:', error);
    }
}


function createCharts(stats) {
    Object.values(charts).forEach(chart => chart?.destroy());

    const chartConfig = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                labels: { color: '#cbd5e1' }
            }
        }
    };

    charts.type = new Chart(document.getElementById('typeChart'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(stats.projects_by_type),
            datasets: [{
                data: Object.values(stats.projects_by_type),
                backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'],
                borderWidth: 0
            }]
        },
        options: chartConfig
    });

    charts.region = new Chart(document.getElementById('regionChart'), {
        type: 'bar',
        data: {
            labels: Object.keys(stats.projects_by_region),
            datasets: [{
                label: 'Projects',
                data: Object.values(stats.projects_by_region),
                backgroundColor: '#6366f1',
                borderRadius: 8
            }]
        },
        options: {
            ...chartConfig,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#cbd5e1' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                x: {
                    ticks: { color: '#cbd5e1' },
                    grid: { display: false }
                }
            }
        }
    });

    charts.complexity = new Chart(document.getElementById('complexityChart'), {
        type: 'pie',
        data: {
            labels: Object.keys(stats.projects_by_complexity),
            datasets: [{
                data: Object.values(stats.projects_by_complexity),
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: chartConfig
    });

    const statusData = {
        'Completed': stats.completed_projects,
        'In Progress': stats.in_progress_projects,
        'Cancelled': stats.cancelled_projects,
        'On Hold': stats.on_hold_projects
    };

    charts.status = new Chart(document.getElementById('statusChart'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusData),
            datasets: [{
                data: Object.values(statusData),
                backgroundColor: ['#10b981', '#3b82f6', '#ef4444', '#f59e0b'],
                borderWidth: 0
            }]
        },
        options: chartConfig
    });
}


function setupPredictionForm() {
    const form = document.getElementById('predictionForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {
            project_cost: parseFloat(formData.get('project_cost')),
            project_benefit: parseFloat(formData.get('project_benefit')),
            complexity: formData.get('complexity'),
            completionpercent: parseFloat(formData.get('completionpercent')),
            actual_duration_days: parseInt(formData.get('actual_duration_days')),
            project_type: formData.get('project_type'),
            region: formData.get('region'),
            department: formData.get('department')
        };

        try {
            const response = await fetch(`${API_BASE_URL}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            displayPredictionResults(result);
        } catch (error) {
            console.error('Prediction error:', error);
            showError('Failed to generate prediction. Please check your inputs and try again.');
        }
    });
}

function displayPredictionResults(result) {
    const resultCard = document.getElementById('predictionResult');
    const delayValue = document.getElementById('delayValue');
    const bottleneckValue = document.getElementById('bottleneckValue');
    const recommendations = document.getElementById('recommendations');

    resultCard.style.display = 'block';

    delayValue.textContent = result.predicted_delay_days.toFixed(2);
    bottleneckValue.textContent = result.resource_bottleneck ? 'Yes ⚠️' : 'No ✅';

    let recommendationsHTML = '<h4>💡 Recommendations</h4><ul style="margin-top: 1rem; padding-left: 1.5rem; color: var(--text-secondary);">';

    if (result.predicted_delay_days > 5) {
        recommendationsHTML += '<li>⚠️ Significant delay predicted. Consider allocating additional resources.</li>';
    } else if (result.predicted_delay_days > 0) {
        recommendationsHTML += '<li>⏱️ Minor delay expected. Monitor progress closely.</li>';
    } else {
        recommendationsHTML += '<li>✅ Project is on track or ahead of schedule.</li>';
    }

    if (result.resource_bottleneck) {
        recommendationsHTML += '<li>🚧 Resource bottleneck detected. Review team allocation and workload distribution.</li>';
    } else {
        recommendationsHTML += '<li>✅ No resource bottlenecks detected. Current allocation appears optimal.</li>';
    }

    const roi = ((result.input_data.project_benefit - result.input_data.project_cost) / result.input_data.project_cost * 100);
    if (roi > 50) {
        recommendationsHTML += '<li>💰 Excellent ROI potential. Prioritize this project.</li>';
    } else if (roi > 0) {
        recommendationsHTML += '<li>📊 Positive ROI expected. Project is financially viable.</li>';
    }

    recommendationsHTML += '</ul>';
    recommendations.innerHTML = recommendationsHTML;

    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}


function renderProjectsTable(projects) {
    const tbody = document.getElementById('projectsTableBody');

    if (projects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading-cell">No projects found</td></tr>';
        return;
    }

    tbody.innerHTML = projects.map(project => `
        <tr>
            <td><strong>${project.project_name}</strong></td>
            <td>${project.project_type}</td>
            <td><span class="status-badge status-${project.status.toLowerCase().replace(' - ', '-')}">${project.status}</span></td>
            <td>${project.completionpercent}%</td>
            <td>${formatCurrency(project.project_cost)}</td>
            <td>${formatCurrency(project.project_benefit)}</td>
            <td>${project.region}</td>
            <td>${project.complexity}</td>
        </tr>
    `).join('');
}

function setupProjectsFilters() {
    const searchInput = document.getElementById('searchProjects');
    const statusFilter = document.getElementById('filterStatus');

    searchInput.addEventListener('input', filterProjects);
    statusFilter.addEventListener('change', filterProjects);
}

function filterProjects() {
    const searchTerm = document.getElementById('searchProjects').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;

    const filtered = allProjects.filter(project => {
        const matchesSearch = project.project_name.toLowerCase().includes(searchTerm) ||
            project.project_type.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || project.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    renderProjectsTable(filtered);
}


function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function showError(message) {
    alert(message);
}

function refreshData() {
    loadDashboardData();
}
