
export async function generateBrainImage(payload: any) {
    const response = await fetch('http://localhost:8000/brain-gen',{
        method: 'POST',
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Error generating brain image: ${response.statusText}`);
    }
    return response.json();

}
