

import React, { useState } from 'react'


// export default function ProteinCalculatorPage() {
//     return <>
//         Text
//         <script src="../proteinCalculator.js"></script>
//     </>
// }


export default function ProteinCalculator() {
    const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">('imperial');

    const [age, setAge] = useState<number | undefined>();

    const [gender, setGender] = useState('male');

    const [height, setHeight] = useState<{ imperial: { feet: number, inches: number }, metric: number } | undefined>();

    const [weight, setWeight] = useState<{ imperial: number, metric: number }>();

    const [activity, setActivity] = useState('light');
    const [proteinIntake, setProteinIntake] = useState<{ rda: number, bodybuilding: number } | undefined>();

    const activityLevels = [
        { value: 'light', label: 'Light: exercise 1-3 times/week' },
        { value: 'moderate', label: 'Moderate: exercise 3-5 times/week' },
        { value: 'intense', label: 'Intense: exercise 6-7 times/week' },
        { value: 'very-intense', label: 'Very Intense: 2+ hours daily exercise' }
    ];

    // Conversion utilities
    const convertHeightToMetric = (feet: number, inches: number) => {
        return Math.round((feet * 30.48) + (inches * 2.54));
    };

    const convertHeightToImperial = (cm: number) => {
        const totalInches = cm / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        return { feet, inches };
    };

    const convertWeightToMetric = (pounds: number) => {
        return Math.round(pounds * 0.453592);
    };

    const convertWeightToImperial = (kg: number) => {
        return Math.round(kg * 2.20462);
    };

    const calculateProtein = () => {
        // Basic protein calculation formula
        let rdaRecommendation = (weight?.metric ?? 0) * 0.8; // RDA recommendation

        let baseRecommendation = 0.75 * (weight?.imperial ?? 0)

        // Adjust for activity level
        switch (activity) {
            case 'light':
                baseRecommendation *= 1.0;
                break;
            case 'moderate':
                baseRecommendation *= 1.1;
                break;
            case 'intense':
                baseRecommendation *= 1.2;
                break;
            case 'very-intense':
                baseRecommendation *= 1.25;
                break;
        }

        // Slight adjustments for age and gender
        if (gender === 'female') baseRecommendation *= 0.85;
        if ((age ?? 0) < 20) {
            baseRecommendation *= 0.9;
        } else if ((age ?? 0) > 40) {
            baseRecommendation *= 1.1;
        }

        setProteinIntake({ bodybuilding: Math.round(baseRecommendation), rda: rdaRecommendation });
    };

    const clearCalculator = () => {
        setAge(21);
        setGender('male');
        setHeight({
            imperial: { feet: 5, inches: 11 },
            metric: 180
        });
        setWeight({
            imperial: 132,
            metric: 60
        });
        setActivity('light');
        setProteinIntake(undefined);
    };

    const updateHeightImperial = (value: number, type: "feet" | "inches") => {
        const newHeight = { ...height?.imperial } as { feet: number, inches: number };
        newHeight[type] = Number(value);

        // Convert to metric for internal calculation
        const metricHeight = convertHeightToMetric(newHeight.feet, newHeight.inches);

        setHeight({
            imperial: newHeight,
            metric: metricHeight
        });

    };

    const updateHeightMetric = (value: number) => {
        setHeight({
            imperial: convertHeightToImperial(Number(value)),
            metric: Number(value)
        });
    }

    const updateWeight = (value: number) => {
        if (unitSystem === 'imperial') {
            setWeight({
                imperial: Number(value),
                metric: convertWeightToMetric(Number(value))
            });
        } else {
            setWeight({
                imperial: convertWeightToImperial(Number(value)),
                metric: Number(value)
            });
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 rounded-lg shadow-xl">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Protein Calculator</h2>
                <div className="flex">
                    <button onClick={() => setUnitSystem('imperial')} className={`px-3 py-1 rounded-l ${unitSystem === 'imperial' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`} >
                        Imperial
                    </button>
                    <button onClick={() => setUnitSystem('metric')} className={`px-3 py-1 rounded-r ${unitSystem === 'metric' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`} >
                        Metric
                    </button>
                </div>
            </div>

            <div className="space-y-4">

                <div className='flex flex-row space-x-5'>
                    {/* Age Input */}
                    <div>
                        <label className="block text-gray-600 mb-2">Age</label>
                        <input
                            type="number"
                            value={age}
                            onChange={(e) => setAge(Number(e.target.value))}
                            className="w-full p-2 bg-gray-200  rounded"
                            min={18}
                            max={80}
                        />
                    </div>
                    {/* Gender Selection */}
                    <div>
                        <label className="block text-gray-600 mb-2">Gender</label>
                        <div className="flex">
                            <button
                                onClick={() => setGender('male')}
                                className={`p-2 rounded-l ${gender === 'male' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                            >
                                Male
                            </button>
                            <button
                                onClick={() => setGender('female')}
                                className={`p-2 rounded-r ${gender === 'female' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                            >
                                Female
                            </button>
                        </div>
                    </div>
                </div>

                {/* Height Input */}
                <div>
                    <label className="block text-gray-600 mb-2">
                        Height {unitSystem === 'imperial' ? '(ft/in)' : '(cm)'}
                    </label>
                    {unitSystem === 'imperial' ? (
                        <div className="flex space-x-2">
                            <input
                                type="number"
                                value={height?.imperial.feet}
                                onChange={(e) => updateHeightImperial(Number(e.target.value), 'feet')}
                                className="w-1/2 p-2 bg-gray-200  rounded"
                                placeholder="Feet"
                            />
                            <input
                                type="number"
                                value={height?.imperial.inches}
                                onChange={(e) => updateHeightImperial(Number(e.target.value), 'inches')}
                                className="w-1/2 p-2 bg-gray-200  rounded"
                                placeholder="Inches"
                            />
                        </div>
                    ) : (
                        <input
                            type="number"
                            value={height?.metric}
                            onChange={(e) => updateHeightMetric(Number(e.target.value))}
                            className="w-full p-2 bg-gray-200  rounded"
                        />
                    )}
                </div>


                {/* Weight Input */}
                <div>
                    <label className="block text-gray-600 mb-2">
                        Weight {unitSystem === 'imperial' ? '(lbs)' : '(kg)'}
                    </label>
                    <input
                        type="number"
                        value={unitSystem === 'imperial' ? weight?.imperial : weight?.metric}
                        onChange={(e) => updateWeight(Number(e.target.value))}
                        className="w-full p-2 bg-gray-200 rounded"
                    />
                </div>

                {/* Activity Level */}
                <div>
                    <label className="block text-gray-600 mb-2">Activity Level</label>
                    <select
                        value={activity}
                        onChange={(e) => setActivity(e.target.value)}
                        className="w-full p-2 bg-gray-200 rounded"
                    >
                        {activityLevels.map((level) => (
                            <option key={level.value} value={level.value}>
                                {level.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                    <button
                        onClick={calculateProtein}
                        className="flex-1 p-3 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Calculate
                    </button>
                    <button
                        onClick={clearCalculator}
                        className="flex-1 p-3 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        Clear
                    </button>
                </div>

                {/* Results */}
                {proteinIntake && (
                    <>
                        <h3 className='text-xl'>Daily Protein Intake</h3>
                        <div className="mt-4 p-4 bg-blue-900 rounded text-center">
                            <p className="text-white text-lg">
                                Expert Recommendation:
                                <span className="font-bold text-blue-200 ml-2">
                                    {proteinIntake.bodybuilding}g
                                </span>
                            </p>
                        </div>
                        <div className="mt-4 p-4 bg-blue-900 rounded text-center">
                            <p className="text-white text-lg">
                                (RDA) Recommended Dietary Allowances:
                                <span className="font-bold text-blue-200 ml-2">
                                    {proteinIntake.rda}g
                                </span>
                            </p>
                        </div>
                    </>
                )}

                <div className='text-end'><a target='_blank' href='https://pecsday.com' className='underline text-sm'>Pecsday</a></div>
            </div>

        </div>
    );
};
