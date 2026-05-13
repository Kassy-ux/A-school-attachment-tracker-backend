import express, {  Application , Response} from 'express';
import dotenv from "dotenv"

const app = express();


const PORT = process.env.PORT || 5000

//Start server


app.listen(PORT,()=>{
    console.log(`🚀 Server running on http://localhost:${PORT}`);
})