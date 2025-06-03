async function initAiDiagnosisPage() {
    const diagnosisForm = document.getElementById('diagnosis-form');
    const resultCard = document.getElementById('diagnosis-result-card');
    
    if (diagnosisForm) {
        diagnosisForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            UI.showSpinner('diagnosis-spinner');
            
            try {
                const description = document.getElementById('problem-description').value;
                const photos = document.getElementById('upload-diagnosis-photos').files;
                
                // تحليل المشكلة باستخدام الذكاء الاصطناعي
                const analysisResult = await AiService.analyzeProblem(description, photos);
                const analysis = analysisResult.choices[0].message.content;
                
                // اقتراح أفضل الصنايعية
                const suggestions = await AiService.suggestProfessionals(description);
                
                displayResults(analysis, suggestions);
                resultCard.style.display = 'block';
                
            } catch (error) {
                UI.showAlert('حدث خطأ أثناء التحليل. يرجى المحاولة مرة أخرى.');
            } finally {
                UI.hideSpinner('diagnosis-spinner');
            }
        });
    }
    
    function displayResults(analysis, suggestions) {
        const outputDiv = document.getElementById('diagnosis-output');
        outputDiv.innerHTML = `
            <div class="analysis-result">
                <h4>التحليل الأولي:</h4>
                <p>${analysis}</p>
                <h4>الصنايعية المقترحون:</h4>
                <div class="suggested-professionals">
                    ${suggestions}
                </div>
            </div>
        `;
    }
}
