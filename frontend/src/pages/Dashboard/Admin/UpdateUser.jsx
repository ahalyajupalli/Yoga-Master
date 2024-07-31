import React, { useState, useEffect } from 'react';
import useAuth from '../../../hooks/useAuth';
import { useLoaderData } from 'react-router-dom';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { toast } from 'react-toastify';

const UpdateUser = () => {
    const { user } = useAuth();
    const userCredentials = useLoaderData();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({});
    const axiosSecure = useAxiosSecure();

    useEffect(() => {
        if (userCredentials) {
            setFormData({
                name: userCredentials.name || '',
                phone: userCredentials.phone || '',
                email: userCredentials.email || '',
                skills: userCredentials.skills || '',
                address: userCredentials.address || '',
                photoUrl: userCredentials.photoUrl || '',
                role: userCredentials.role || 'user', // Default role
                about: userCredentials.about || ''
            });
        }
    }, [userCredentials]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const updatedData = new FormData(form);
        const data = Object.fromEntries(updatedData);

        try {
            setLoading(true);
            await axiosSecure.put(`/update-user/${userCredentials?._id}`, data);
            alert('Update successful!');
        } catch (error) {
            alert('Update failed!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className='text-center text-4xl font-bold mt-5'>
                Update: <span className='text-secondary'>{user?.displayName}</span>
            </h1>
            <p className='text-center'>
                Change details about <span className='text-red-400 font-bold'>{user?.displayName}</span>
            </p>
            <section>
                <div className="mx-auto px-4 py-16 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-8 shadow-lg lg:p-12">
                        <form className="space-y-4" onSubmit={handleFormSubmit}>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="ml-2 pb-4" htmlFor="name">Name</label>
                                    <input
                                        className="w-full rounded-lg mt-3 border outline-none border-secondary p-3 text-sm"
                                        placeholder="Your Name"
                                        type="text"
                                        required
                                        value={formData.name || ''}
                                        id="name"
                                        name='name'
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="ml-2" htmlFor="phone">Phone</label>
                                    <input
                                        className="w-full mt-3 rounded-lg border outline-none border-secondary p-3 text-sm"
                                        placeholder="Phone Number"
                                        required
                                        type="tel"
                                        id="phone"
                                        value={formData.phone || ''}
                                        name='phone'
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="ml-2" htmlFor="email">Email</label>
                                    <p className='text-[12px] ml-2 text-red-400'>Update email is not recommended. Please leave it default</p>
                                    <input
                                        className="w-full mt-2 rounded-lg border outline-none border-secondary p-3 text-sm"
                                        placeholder="Email address"
                                        type="email"
                                        required
                                        value={formData.email || ''}
                                        name="email"
                                        id="email"
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="ml-2" htmlFor="skills">Skills</label>
                                    <p className='text-[12px] ml-2 text-red-400'>If the user is an instructor, then set skills; otherwise, leave it empty</p>
                                    <input
                                        className="w-full mt-2 rounded-lg border outline-none border-secondary p-3 text-sm"
                                        placeholder="Skills"
                                        value={formData.skills || ''}
                                        type="text"
                                        name="skills"
                                        onChange={e => setFormData({ ...formData, skills: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="ml-2" htmlFor="address">Address</label>
                                    <input
                                        className="w-full mt-2 rounded-lg border outline-none border-secondary p-3 text-sm"
                                        placeholder="Address"
                                        required
                                        value={formData.address || ''}
                                        name='address'
                                        type="text"
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="ml-2" htmlFor="photoUrl">Photo URL</label>
                                    <input
                                        className="w-full mt-2 rounded-lg border outline-none border-secondary p-3 text-sm"
                                        placeholder="Photo URL"
                                        required
                                        value={formData.photoUrl || ''}
                                        name='photoUrl'
                                        type="text"
                                        onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-center text-lg font-semibold">Please select a role</h2>
                                <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
                                    <div>
                                        <input
                                            className="peer sr-only"
                                            id="option1"
                                            type="radio"
                                            value='user'
                                            checked={formData.role === 'user'}
                                            tabIndex="-1"
                                            name="role"
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        />
                                        <label
                                            htmlFor="option1"
                                            className="block w-full rounded-lg border border-secondary p-3 peer-checked:border-secondary peer-checked:bg-secondary peer-checked:text-white"
                                            tabIndex="0"
                                        >
                                            <span className="text-sm font-medium">User</span>
                                        </label>
                                    </div>
                                    <div>
                                        <input
                                            className="peer sr-only"
                                            id="option2"
                                            type="radio"
                                            value='admin'
                                            checked={formData.role === 'admin'}
                                            tabIndex="-1"
                                            name="role"
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        />
                                        <label
                                            htmlFor="option2"
                                            className="block w-full rounded-lg border border-secondary p-3 peer-checked:border-secondary peer-checked:bg-secondary peer-checked:text-white"
                                            tabIndex="0"
                                        >
                                            <span className="text-sm font-medium">Admin</span>
                                        </label>
                                    </div>
                                    <div>
                                        <input
                                            className="peer sr-only"
                                            id="option3"
                                            type="radio"
                                            value='instructor'
                                            checked={formData.role === 'instructor'}
                                            tabIndex="-1"
                                            name="role"
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        />
                                        <label
                                            htmlFor="option3"
                                            className="block w-full rounded-lg border border-secondary p-3 peer-checked:bg-secondary peer-checked:text-white"
                                            tabIndex="0"
                                        >
                                            <span className="text-sm font-medium">Instructor</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="sr-only" htmlFor="about">About</label>
                                <textarea
                                    className="w-full resize-none rounded-lg border-secondary border outline-none p-3 text-sm"
                                    placeholder="About user"
                                    rows="4"
                                    value={formData.about || ''}
                                    name='about'
                                    id="about"
                                    onChange={e => setFormData({ ...formData, about: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="mt-4">
                                <button
                                    type="submit"
                                    className="inline-block w-full rounded-lg bg-secondary px-5 py-3 font-medium text-white sm:w-auto"
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update user'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default UpdateUser;
