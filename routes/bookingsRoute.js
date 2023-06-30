const express = require('express')
const router = express.Router()
const Booking = require('../model/booking')
const moment = require("moment")
const Room = require('../model/room')
const { v4: uuidv4 } = require('uuid');
const stripe = require("stripe")("sk_test_51NFYDZSGc5qh12aflcd2QMBcMb67W5FnGjXmZNeb5CD0IGBY46gFiUlZiWAiS0A87usGGNyLjSJix4RKQogyofuL00DlZtI5QT")
router.post('/bookroom',async(req,res)=>{
    const  {room,
           userid,
           fromdate,
           todate,
           totalamount,totaldays,token
    }=req.body
    try{
       
        const payment = await stripe.paymentIntents.create({
            amount: totalamount * 100,
            currency: 'gbp',
            payment_method: 'pm_card_visa',
        },{
            idempotencyKey: uuidv4() 
        })
        res.send('Payment Successfull' + totalamount)

        if(payment){
            try{
                const newbooking = new Booking({
                    room: room.name,
                    roomid: room._id,
                    userid,
                    fromdate,
                    todate,
                    totalamount,
                    totaldays,
                    transactionId: '1234'
                })
                const booking = await newbooking.save()
                const roomtemp = await Room.findOne({_id: room._id});
                roomtemp.currentbookings.push({
                    bookingid: booking._id,
                    fromdate: fromdate,
                    todate: todate,
                    userid: userid,
                    status: booking.status
        
                })
                const updatedRoom = await roomtemp.save();
              
                
            }catch(error){
                console.log(error);
                return res.status(400).json({error});
            }
        }
    }
    catch(error){
        console.log(error);
        return res.status(400).json({error});
    }

})


router.post('/getbookingsbyuserid', async(req, res)=>{
    const uid =  req.body.userid;
    try{
        const bookings = await Booking.find({userid: uid});
        res.send(bookings);

    }
    catch(error){
        return res.status(400).json({error});
    }

}
)

router.post('/cancelbooking', async(req, res)=>{
    const {bookingid,roomid} =  req.body;
    try{
       
        const bookingitem = await Booking.findOne({_id: bookingid});
       
        bookingitem.status = 'cancelled'
        await bookingitem.save()
        const room = await Room.findOne({_id : roomid})
        const bookings = room.currentbookings
        const temp = bookings.filter(booking=>booking.bookingid.toString()!==bookingid)
        room.currentbookings=temp
        await room.save()
        res.send("Your booking cancelled successfully")
    }
    catch(error){
        return res.status(400).json({error});
    }

}
)


router.get('/getallbookings', async(req, res)=>{
    try{
        const bookings = await Booking.find();
        res.send(bookings)
    }
    catch(error){
        return res.status(400).json({error});
    }
})


module.exports = router