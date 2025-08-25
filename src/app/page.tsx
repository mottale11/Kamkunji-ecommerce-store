'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaSearch, FaHeart, FaPlus, FaBars, FaTimes, FaArrowRight, FaStar, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import CategoryList from '@/components/CategoryList';
import FeaturedProducts from '@/components/FeaturedProducts';
import CartCount from '@/components/CartCount';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Enhanced Header with animations */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo with animation */}
            <Link href="/" className="group">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white font-bold text-xl">K</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Kamkunji Ndogo
                </span>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-8">
              <Link href="/" className="font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 relative group">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="/#categories" className="font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 relative group">
                Categories
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="/#featured" className="font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 relative group">
                Featured
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </nav>
            
            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              <Link href="/cart" className="relative group">
                <div className="p-2 rounded-full bg-gray-100 group-hover:bg-pink-100 transition-colors duration-200">
                  <FaHeart className="text-gray-600 group-hover:text-pink-500 transition-colors duration-200" size={20} />
                </div>
                <CartCount />
              </Link>
              
              <Link 
                href="/submit" 
                className="hidden md:flex bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-full items-center space-x-2 hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FaPlus size={14} />
                <span>Submit Item</span>
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
            isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <nav className="py-4 space-y-3">
              <Link href="/" className="block py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200">Home</Link>
              <Link href="/#categories" className="block py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200">Categories</Link>
              <Link href="/#featured" className="block py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200">Featured</Link>
              <Link href="/submit" className="block py-2 text-blue-600 font-medium">Submit Item</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section with animations */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white pt-24 pb-16 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up">
              Find Amazing
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                Second-Hand Deals
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-blue-100 animate-fade-in-up animation-delay-200">
              Discover quality pre-owned items at unbeatable prices from trusted sellers in your community. 
              Save money while helping the environment!
            </p>
            
            {/* Enhanced search bar */}
            <div className="max-w-2xl mx-auto animate-fade-in-up animation-delay-400">
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                <div className="flex-grow px-6 py-4">
                  <input 
                    type="text" 
                    placeholder="Search for items, categories, or locations..." 
                    className="w-full bg-transparent text-white placeholder-blue-200 focus:outline-none text-lg"
                  />
                </div>
                <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2">
                  <FaSearch size={20} />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-600">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">500+</div>
                <div className="text-blue-200 text-sm">Items Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">50+</div>
                <div className="text-blue-200 text-sm">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">1000+</div>
                <div className="text-blue-200 text-sm">Happy Buyers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">24/7</div>
                <div className="text-blue-200 text-sm">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Categories Section */}
      <section id="categories" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Browse Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of categories to find exactly what you're looking for
            </p>
          </div>
          <CategoryList />
        </div>
      </section>

      {/* Enhanced Featured Products Section */}
      <section id="featured" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Handpicked items that offer the best value and quality
            </p>
          </div>
          <FeaturedProducts />
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">K</span>
                </div>
                <span className="text-xl font-bold">Kamkunji Ndogo</span>
              </div>
              <p className="text-gray-400 mb-4">The best marketplace for second-hand items in Kenya</p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-200">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" /></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-200">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" /></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-200">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" /></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white transition-colors duration-200">Home</Link></li>
                <li><Link href="/#categories" className="text-gray-400 hover:text-white transition-colors duration-200">Categories</Link></li>
                <li><Link href="/#featured" className="text-gray-400 hover:text-white transition-colors duration-200">Featured</Link></li>
                <li><Link href="/submit" className="text-gray-400 hover:text-white transition-colors duration-200">Submit Item</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Admin</h3>
              <Link href="/admin/login" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200">
                <span>Admin Login</span>
                <FaArrowRight size={14} />
              </Link>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} Kamkunji Ndogo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
