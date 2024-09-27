"use client";
import { useState, useEffect } from 'react';
import Layout from "../components/Layout";
import { useSession } from "next-auth/react";
import axios from 'axios';
import Link from 'next/link';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchCartItems();
      fetchUsers();
    } else if (status === "unauthenticated") {
      // Handle unauthenticated state
      setLoading(false);
    }
  }, [status, session]);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get(`/api/cart?userId=${session.user.id}`);
      setCartItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleRemoveItem = async (stokIsmi) => {
    try {
      await axios.delete(`/api/cart?userId=${session.user.id}&stokIsmi=${stokIsmi}`);
      fetchCartItems();
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedUser) {
      alert('Please select a user');
      return;
    }

    try {
      const orderData = {
        items: cartItems.map(item => ({
          stokIsmi: item.stokIsmi,
          quantity: item.quantity
        })),
        userId: selectedUser,
        createdBy: session.user.id
      };

      console.log('Sending order data:', orderData);

      const response = await axios.post('/api/orders', orderData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });

      console.log('Server response:', response.data);

      if (response.data && response.data.message === 'Order created successfully') {
        try {
          await axios.delete(`/api/cart?userId=${session.user.id}`);
          console.log('Cart cleared successfully');
        } catch (cartError) {
          console.error('Error clearing cart:', cartError.response ? cartError.response.data : cartError.message);
          // Don't throw an error here, as the order was still created successfully
        }
        fetchCartItems();
        setSelectedUser('');
        alert('Order created successfully!');
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      console.error('Error creating order:', error.response ? error.response.data : error.message);
      alert(`Failed to create order. Error: ${error.response ? error.response.data.error : error.message}`);
    }
  };

  if (status === "loading" || loading) {
    return <Layout><div>Loading...</div></Layout>;
  }

  if (status === "unauthenticated") {
    return <Layout><div>Please log in to view your cart.</div></Layout>;
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Cart</h1>
      {cartItems.length === 0 ? (
        <div className="text-center">
          <p className="mb-4">Your cart is empty.</p>
          <Link href="/urunArama" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Go to Product Search
          </Link>
        </div>
      ) : (
        <div>
          <ul className="mb-4">
            {cartItems.map((item) => (
              <li key={item.stokIsmi} className="flex justify-between items-center mb-2">
                <span>{item.stokIsmi} - Quantity: {item.quantity}</span>
                <button
                  onClick={() => handleRemoveItem(item.stokIsmi)}
                  className="bg-red-500 text-white p-2 rounded"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="mb-4">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="border p-2 mr-2"
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCreateOrder}
            className="bg-green-500 text-white p-2 rounded"
          >
            Create Order
          </button>
        </div>
      )}
    </Layout>
  );
}