document.addEventListener('DOMContentLoaded', () => {
    let labs = [
        { title: 'Бірінші лабаротория', description: 'Енгізілген күн (күн және ай) негізінде бір жылдағы осы күннің реттік нөмірін есептеңіз (кібісе жылдарды есепке алмаңыз). Жыл мезгілін анықтаңыз. Берілген айдың күні дұрыс енгізілгенін тексеріңіз (мысалы, 32 қаңтар, 29 ақпан, 31 сәуір).' },
        { title: 'Екінші лабаротория', description: 'Комплекс сандарға арифметикалық амалдар орындайтын программа құрыңыз. Бағдарлама болуы керек:' },
        { title: 'Үшінші лабаротория', description: 'Мәтіндік файлды талдайтын және келесі ақпаратты шығаратын бағдарламаны жазыңыз:' },
    ];

    const labForm = document.getElementById('lab-form');
    const labsList = document.getElementById('labs');
    const pythonCodeTextarea = document.getElementById('python-code');
    const importButton = document.getElementById('import');

    labForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;

        const lab = { title, description };

        labs.push(lab);
        updateLabsList();

        labForm.reset();
    });

    importButton.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files.length === 0) return;

        const file = files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            const importedData = event.target.result;
            const importedLab = parseImportedData(importedData);
            if (importedLab) {
                labs.push(importedLab);
                updateLabsList();
            } else {
                alert('Ошибка: Неверный формат файла.');
            }
        };
        reader.readAsText(file);
    });

    function parseImportedData(data) {
        const lines = data.split('\n');
        if (lines.length < 2) return null;
        const title = lines[0].trim();
        const description = lines.slice(1).join('\n').trim();
        return { title, description };
    }

    function updateLabsList() {
        labsList.innerHTML = '';

        labs.forEach((lab, index) => {
            const labItem = document.createElement('li');
            labItem.innerHTML = `
                <h3>${lab.title}</h3>
                <p>${lab.description}</p>
                <button class="delete-lab" data-index="${index}">Өшіру</button>
                <button class="navigate-lab" data-index="${index}">Python</button>
                <button class="export-lab" data-index="${index}">Экспорт</button>
            `;
            labsList.appendChild(labItem);
        });

        const deleteButtons = document.querySelectorAll('.delete-lab');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                labs.splice(index, 1);
                updateLabsList();
            });
        });

        const navigateButtons = document.querySelectorAll('.navigate-lab');
        navigateButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                window.location.href = `https://www.programiz.com/python-programming/online-compiler/?index=${index}`;
            });
        });

        const exportButtons = document.querySelectorAll('.export-lab');
        exportButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                exportLab(index);
            });
        });
    }

    function exportLab(index) {
        const labToExport = labs[index];
        const labData = `${labToExport.title}\n\n${labToExport.description}`;
        const blob = new Blob([labData], { type: 'text/plain' });
        const filename = `${labToExport.title}.txt`;
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, filename);
        } else {
            const link = document.createElement('a');
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }

    updateLabsList();

    document.getElementById('run-python').addEventListener('click', () => {
        const code = pythonCodeTextarea.value;
        runPythonCode(code).then(result => {
            document.getElementById('python-output').textContent = result;
        }).catch(error => {
            document.getElementById('python-output').textContent = `Error: ${error.message}`;
        });
    });

    async function runPythonCode(code) {
        const response = await fetch('https://pyodide-cdn2.iodide.io/v0.15.0/full/pyodide.js');
        const pythonInterpreterCode = await response.text();

        eval(pythonInterpreterCode);

        await languagePluginLoader;

        const result = await pyodide.runPythonAsync(code);
        return result;
    }
});
