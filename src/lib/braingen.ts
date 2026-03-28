
export async function generateBrainImage(payload: any) {
    try{
        const response = await fetch('https://socr-image-gen-backend.nvtcqyjt0g9ej.us-east-1.cs.amazonlightsail.com/generate',{
            method: 'POST',
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Error generating brain image: ${response.statusText}`);
        }
        const data = await response.json();
        return data.image_ids;
    }
    catch(error){
        console.error('Error generating brain image:', error);
        return payload;
    }
}
