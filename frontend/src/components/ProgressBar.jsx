function ProgressBar({ currentStep, totalSteps }) {
    const progress = (currentStep / totalSteps) * 100;
    
    return (
        <div className="w-full max-w-md mx-auto mb-8">
            <div className="w-full h-2 rounded-full bg-plum">
                <div 
                    className="h-2 transition-all duration-300 ease-out rounded-full bg-lilac"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <div className="mt-2 text-sm text-center text-gray-600">
            </div>
        </div>
    );
}

export default ProgressBar;