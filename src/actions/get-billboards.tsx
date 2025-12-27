import { Billboard } from '@/types';

const URL = `${process.env.NEXT_PUBLIC_API_URL}/billboards`;

const 
Now its time to make the home page as youve said in homepage design's design idea 1.
The sequence will be:

- announcement bar (new, rotating message)
- Navbar (existing, fixed)
- Hero Billboard (Existing, keep)
- Shop by category (Visual category cards with images, horizontal swipe)
- Featured Products (existing, horizontal swipe)
- Value Proposition bar (make it generic for template, use icons from lucid react or more premium icon library as you wish)
- Promotional Banner (full width image, lorem ipsum, implemented in a way that goes as a generic for maximum templates)
- New Arrival section (new, upto 10 products will come from api)
- Customer Testimonial (leave it for now. as i havent planned the architecture flow around it for dashboard)
- Marquee (already there, you can enhance it)
- Best seller section (leave it for now)
- upcoming products (already made)
- newsletter signup (make it generic and again if youre using image in it then give me prompt for nanobanana i'll generate it and replace it wherever you want)
- footer (already made but if scope of enhancements then do it)


Ive done the dashboard changes for following. like this:

- announcement bar implemented in the dashboard
http://localhost:3000/api/fc3458f7-8208-45f1-99fe-be843e22e83a/announcement-bar

{
    "id": "4c03e262-f460-49c0-8c27-ba549a8ac69b",
    "storeId": "fc3458f7-8208-45f1-99fe-be843e22e83a",
    "messages": [
        {
            "text": "sale sale sale",
            "emoji": "💰",
            "linkId": "f0a28beb-d11b-47d7-bec5-f85f84953232",
            "linkType": "category"
        },
        {
            "text": "free shipping on order above $500!",
            "emoji": "💸",
            "linkId": "0e035e1d-47ce-4573-ac4d-64b6d9af8a36",
            "linkType": "product"
        }
    ],
    "backgroundColor": "#FFFF00",
    "dismissible": true,
    "isActive": true,
    "createdAt": "2025-12-25T21:54:25.610Z",
    "updatedAt": "2025-12-25T21:58:40.819Z"
}


- then ive made the category image too:

http://localhost:3000/api/fc3458f7-8208-45f1-99fe-be843e22e83a/categories

[
    {
        "id": "f0a28beb-d11b-47d7-bec5-f85f84953232",
        "name": "cat1",
        "imageUrl": "https://res.cloudinary.com/dls3aa1bw/image/upload/v1766698662/uy5rbicfli4wmrljhvws.png",
        "storeId": "fc3458f7-8208-45f1-99fe-be843e22e83a",
        "createdAt": "2025-12-25T21:37:52.467Z",
        "updatedAt": "2025-12-25T21:37:52.467Z",
        "billboard": [
            {
                "id": "ae2f3a88-bd22-456c-8e13-d37fb97e0481",
                "categoryId": "f0a28beb-d11b-47d7-bec5-f85f84953232",
                "billboardId": "d551867a-0a5e-48ee-be59-238a1b918b55",
                "createdAt": "2025-12-25T21:37:52.478Z",
                "billboard": {
                    "id": "d551867a-0a5e-48ee-be59-238a1b918b55",
                    "storeId": "fc3458f7-8208-45f1-99fe-be843e22e83a",
                    "label": "b1",
                    "imageUrl": "https://res.cloudinary.com/dls3aa1bw/image/upload/v1766698641/pcf9wlijest3jmowdkw3.png",
                    "createdAt": "2025-12-25T21:37:27.132Z",
                    "updatedAt": "2025-12-25T21:37:27.132Z"
                }
            }
        ]
    }
]


- then ive made the promotional banner

http://localhost:3000/api/fc3458f7-8208-45f1-99fe-be843e22e83a/stores
this endpoint will give all the things for the homepage. Ive only implemented the promotional banner (single banner)

{
    "id": "fc3458f7-8208-45f1-99fe-be843e22e83a",
    "name": "test22",
    "promotionalBanner": "https://res.cloudinary.com/dls3aa1bw/image/upload/v1766699439/gysr5e98axu3xrzzt1t9.png",
    "createdAt": "2025-12-25T08:53:11.762Z",
    "updatedAt": "2025-12-25T21:50:41.947Z"
}


- then ive added new arrivals query param too:

http://localhost:3000/api/fc3458f7-8208-45f1-99fe-be843e22e83a/products?filter=new-arrivals

this will give list of all the new arrivals product that comes within the New Arrival Duration (days) from the date of creation, duration is configured on settings of dashboard. Also if the New Arrival Duration is 0, then this feature is disabled and no products will be returned. So we will conditional render the new arrival section on the store front based on if we get any products from this endpoint.




SEE ALREADY EXISTING CODE OF actions and UI of homepage then make changes. You can change the already done stuff for enhancements and overall design, however you want. Make code modular. make different component for each section!! = async (id: string): Promise<Billboard> => {
  try {
    const res = await fetch(`${URL}/${id}`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response is not JSON');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching billboard:', error);
    return {
      id: '',
      label: 'Error loading billboard',
      imageUrl: ''
    };
  }
};

export default getBillboard;
