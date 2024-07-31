import React, { useEffect, useState } from "react";
import useAxiosFetch from "../../hooks/useAxiosFetch";
import { Transition } from "@headlessui/react";
import { useUser } from "../../hooks/useUser";
import { toast } from "react-toastify";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { Link, useNavigate } from "react-router-dom";

const Classes = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const { currentUser } = useUser();
  const role = currentUser?.role;
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();
  const axiosFetch = useAxiosFetch();
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    axiosFetch
      .get("/classes")
      .then((res) => {
        // Filter out only approved classes
        const approvedClasses = res.data.filter(cls => cls.status === 'approved');
        setClasses(approvedClasses);
      })
      .catch((err) => console.log(err));
  }, [axiosFetch]);

  useEffect(() => {
    if (currentUser) {
      axiosSecure
        .get(`/enrolled-classes/${currentUser?.email}`)
        .then((res) => setEnrolledClasses(res.data))
        .catch((err) => console.log("Error fetching enrolled classes:", err));
    }
  }, [currentUser, axiosSecure]);

  const handleSelect = (id) => {
    if (!currentUser) {
      alert("Please Login First");
      return navigate("/login");
    }

    axiosSecure
      .get(`/cart-item/${id}?email=${currentUser.email}`)
      .then((res) => {
        if (res.data && res.data.classId === id) {
          toast.info("Already Selected");
        } else if (enrolledClasses.some((item) => item.classes._id === id)) {
          toast.info("Already Enrolled");
        } else {
          const data = {
            classId: id,
            userMail: currentUser.email,
            date: new Date(),
          };

          axiosSecure
            .post("/add-to-cart", data)
            .then(() => toast.success("Successfully added to the cart"))
            .catch((error) => {
              console.error("Error adding to cart:", error.response);
              toast.error("Failed to add to cart");
            });
        }
      })
      .catch((err) => console.log("Error fetching cart item:", err));
  };

  return (
    <div>
      <div className="mt-20 pt-3">
        <h1 className="text-4xl font-bold text-center text-secondary">
          Classes
        </h1>
      </div>

      <div className="my-16 w-[90%] gap-8 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mx-auto">
        {classes.length === 0 ? (
          <p className="text-center text-xl">No approved classes available.</p>
        ) : (
          classes.map((cls, index) => (
            <div
              key={cls._id}
              className={`relative hover:-translate-y-2 duration-150 hover:ring-[2px] hover:ring-secondary w-64 mx-auto ${
                cls.availableSeats < 1 ? "bg-red-300" : "bg-white"
              } dark:bg-slate-600 rounded-lg shadow-lg overflow-hidden cursor-pointer`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="relative h-48">
                <div
                  className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                    hoveredCard === index ? "opacity-60" : "opacity-0"
                  }`}
                />
                <img
                  src={cls.image}
                  alt="Course Image"
                  className="object-cover w-full h-full"
                />
                <Transition
                  show={hoveredCard === index}
                  enter="transition-opacity duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="transition-opacity duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => handleSelect(cls._id)}
                      title={
                        role === "admin" || role === "instructor"
                          ? cls.availableSeats < 1
                            ? "No seats available"
                            : "Instructor/Admin cannot select"
                          : "You can select this class"
                      }
                      disabled={
                        role === "admin" ||
                        role === "instructor" ||
                        cls.availableSeats < 1
                      }
                      className="px-4 py-2 text-white disabled:bg-red-300 bg-secondary duration-300 rounded hover:bg-red-700"
                    >
                      Add to Cart
                    </button>
                  </div>
                </Transition>
              </div>
              <div className="px-6 py-2">
                <h3
                  className={`${
                    cls.name && cls.name.length > 25 ? "text-[14px]" : "text-[16px]"
                  } font-bold`}
                >
                  {cls.name}
                </h3>
                <p className="text-gray-500 text-xs">Instructor: {cls.instructorName}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-gray-600 text-xs">
                    Available Seats: <span className="text-secondary">{cls.availableSeats}</span>
                  </span>
                  <span className="text-green-500 font-semibold">${cls.price}</span>
                </div>
                <Link to={`/class/${cls._id}`}>
                  <button className="px-4 py-2 my-4 mt-4 w-full mx-auto text-white bg-secondary duration-300 rounded hover:bg-red-700">
                    View
                  </button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Classes;
