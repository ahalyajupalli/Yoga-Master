import React, { useEffect, useState } from 'react';
import useAxiosFetch from '../../../../../hooks/useAxiosFetch';
import useAxiosSecure from '../../../../../hooks/useAxiosSecure';
import { useUser } from '../../../../../hooks/useUser';
import moment from 'moment';
import Pagination from '@mui/material/Pagination';
import { ThemeProvider, createTheme } from '@mui/material';
import { ScaleLoader } from 'react-spinners';
const MyPaymentHistory = () => {
  const axiosFetch = useAxiosFetch();
  const axiosSecure = useAxiosSecure();
  const { currentUser, isLoading: userLoading } = useUser();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginatedPayments, setPaginatedPayments] = useState([]);
  const totalItem = payments.length;
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const totalPage = Math.ceil(totalItem / itemsPerPage);

  const handleChange = (event, value) => {
    setPage(value);
  };

  useEffect(() => {
    const lastIndex = page * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    const currentItems = payments.slice(firstIndex, lastIndex);
    setPaginatedPayments(currentItems);
  }, [page, payments]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axiosFetch.get(`/payment-history/${currentUser.email}`);
        setPayments(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching payment history:', error);
        setLoading(false);
      }
    };
  
    if (currentUser?.email) {
      fetchPayments();
    }
  }, [currentUser?.email]);
  

  if (userLoading || loading) {
    return <p>Loading...</p>;
  }

  if (!currentUser) {
    return <p>User is not logged in or does not exist.</p>;
  }
  const theme = createTheme({
    palette: {
        primary: {
            main: '#FF1949', // Set the primary color
        },
        secondary: {
            main: '#FF1949', // Set the secondary color
        },
    },
});
  const totalPaidAmount = payments.reduce((acc, payment) => acc + payment.amount, 0);

  return (
    <div>
      <div className="text-center mt-6 mb-16">
        <p className='text-gray-400'>Hey, <span className='text-secondary font-bold'>{currentUser.name}</span> Welcome...!</p>
        <h1 className='text-4xl font-bold'>My Paym<span className='text-secondary'>ent Hist</span>ory</h1>
        <p className='text-gray-500 text-sm my-3'>You can see your payment history here </p>
      </div>
      {/* table here  */}
      <div>
                <div>
                    <p className='font-bold'>Total Payments : {payments.length}</p>
                    <p className='font-bold'>Total Paid :${totalPaidAmount}</p>
                </div>
                <div className="flex flex-col">
                    <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                            <div className="overflow-hidden">
                                <table className="min-w-full text-left text-sm font-light">
                                    <thead className="border-b font-medium dark:border-neutral-500">
                                        <tr>
                                            <th scope="col" className="px-6 py-4">#</th>
                                            <th scope="col" className="px-6 py-4">Amount</th>
                                            <th scope="col" className="px-6 py-4">Total Item</th>
                                            <th scope="col" className="px-6 py-4">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            paginatedPayments.map((payment, idx) => (
                                                <tr
                                                    key={payment._id}
                                                    className="border-b transition duration-300 ease-in-out hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-600"
                                                >
                                                    <td className="whitespace-nowrap px-6 py-4 font-medium">{(page - 1) * itemsPerPage + idx + 1}</td>
                                                    <td className="whitespace-nowrap px-6 py-4">{payment.amount}</td>
                                                    <td className="whitespace-nowrap px-6 py-4">{payment.classesId.length}</td>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        {moment(payment.date).format('MMMM Do YYYY, h:mm a')}
                                                    </td>
                                                </tr>
                                            ))
                                        }

                                    </tbody>
                                </table>
                                <div className="mt-5">
                                    <ThemeProvider theme={theme}>
                                        <Pagination onChange={handleChange} count={totalPage} color="secondary" />
                                    </ThemeProvider>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
      </div>

    </div>
  );
};

export default MyPaymentHistory;
