import express, { Request, Response } from "express";
const router = express.Router(); 

router.put('/', (req: Request, res: Response) => { 
    res.send('post an account account'); 
})

router.get('/', (req: Request, res: Response) => { 
    res.send('get all savedCourses'); 
})

router.get('/', (req: Request, res: Response) => { 
    res.send('get all review questions'); 
})

router.post('/', (req: Request, res: Response) => { 
    res.send('remove saves courses'); 
})

router.post('/', (req: Request, res: Response) => { 
    res.send('saved courses'); 
})

router.post('/', (req: Request, res: Response) => { 
    res.send('review Questions'); 
})

module.exports = router; 