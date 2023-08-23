const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../model/tourModel');
const catchAsync = require('./../util/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('./../util/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourID);

    // console.log(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${
            req.params.tourID
        }&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourID,
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    unit_amount: tour.price * 100,
                    product_data: {
                        name: tour.name,
                        description: tour.summary,
                        images: [
                            `${req.protocol}://${req.get('host')}/img/tours/${
                                tour.imageCover
                            }`,
                        ],
                    },
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
    });

    res.status(200).json({
        status: 'success',
        session,
    });
});
