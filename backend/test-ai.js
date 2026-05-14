import fetch from 'node-fetch';

const testAI = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/ai/financial-advice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                familyData: { totalWealth: 100000, monthlyIncome: 50000, members: ["Me"] },
                goals: [{ name: "Car", target: 500000, current: 10000 }],
                currentInvestments: "None"
            })
        });

        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
};

testAI();
