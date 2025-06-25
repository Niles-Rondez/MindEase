function Hobby({ hobby, isSelected, onToggle }) {
    return (
        <button
            onClick={() => onToggle(hobby.id)}
            className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full border transition-all duration-200 text-sm font-medium ${
                isSelected
                    ? 'border-lilac bg-lilac text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-lilac/50 hover:bg-gray-50'
            }`}
        >
            <span className="text-base">{hobby.icon}</span>
            <span>{hobby.name}</span>
            <div className={`w-4 h-4 flex items-center justify-center text-xl font-bold${
                isSelected
                    ? ' text-white'
                    : ' text-gray-600'
            }`}>
                {isSelected ? '−' : '+'}
            </div>
        </button>
    );
}

export default Hobby;