function GenderSlider({ selectedGender, onGenderChange }) {
    const options = ['Male', 'Female', 'Others'];
    
    const getSliderPosition = () => {
        const index = options.indexOf(selectedGender);
        if (index === -1) return '0%';
        return `${(index * 100) / 3}%`;
    };
    
    const getSliderWidth = () => {
        return `${100 / 3}%`;
    };
    
    return (
        <div className="mb-4">
            <label className="block px-2 mb-2 text-xl text-black/50 font-inter">Biological Sex</label>
            <div className="relative flex p-1 overflow-hidden bg-white border border-gray-300 rounded-lg">
                <div
                    className="absolute top-0 bottom-0 transition-all duration-300 ease-out transform scale-110 rounded-md shadow-sm bg-lilac"
                    style={{
                        left: getSliderPosition(),
                        width: getSliderWidth(),
                        opacity: selectedGender ? 1 : 0
                    }}
                />
                
                {options.map((option) => (
                    <button
                        key={option}
                        onClick={() => onGenderChange(option)}
                        className={`relative flex-1 py-2 px-4 text-center transition-all duration-200 z-10 ${
                            selectedGender === option
                                ? 'text-white font-bold'
                                : 'text-black font-semibold hover:text-gray-600'
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default GenderSlider;