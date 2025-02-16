"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import Hero from "@/components/Hero";
import Sections from "@/components/Sections";
import SizeSelection from "@/components/SizeSelection";
import MultiContainerFlavorSelection from "@/components/MultiContainerFlavorSelection";
import ContactPayment from "@/components/ContactPayment";
import RealizarP from "./realizar-pedido/page";
import OrderConfirmation from "@/components/OrderConfirmation";

export default function Inicio() {
  const [maxSabores, setMaxSabores] = useState(4);
  const [cantidad, setCantidad] = useState(1);
  const [pasoActual, setPasoActual] = useState("inicio");

  const manejarSeleccionTamano = (newMaxFlavors: number, newQuantity: number) => {
    setMaxSabores(newMaxFlavors);
    setCantidad(newQuantity);
  };

  const renderizarPaso = () => {
    switch (pasoActual) {
      case "inicio":
        return (
          <>
            <Hero />
            <div className="container mx-auto px-4">
              <Sections />
              <SizeSelection onSizeSelect={manejarSeleccionTamano} />
              <MultiContainerFlavorSelection maxFlavors={maxSabores} quantity={cantidad} />
              <ContactPayment onNext={() => setPasoActual("realizar-pedido")} />
            </div>
          </>
        );
      case "realizar-pedido":
        return <RealizarP onNext={() => setPasoActual("confirmacion-pedido")} onBack={() => setPasoActual("inicio")} />;
      case "confirmacion-pedido":
        return <OrderConfirmation onBack={() => setPasoActual("realizar-pedido")} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>{renderizarPaso()}</main>
      <footer className="bg-white py-6">
        <div className="container mx-auto px-4 text-center">
          <a
            href="https://wa.me/+541130171218"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition duration-300"
          >
            <svg
              key="whatsapp-icon"
              className="w-6 h-6 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20.4 3.6C18.2 1.3 15.2 0 12 0 5.5 0 0.1 5.4 0.1 11.9c0 2.1 0.5 4.1 1.5 5.9l-1.6 5.8 6-1.6c1.7 0.9 3.7 1.4 5.7 1.4 6.5 0 11.8-5.4 11.8-11.9 0-3.2-1.2-6.2-3.5-8.4zM12 21.8c-1.8 0-3.5-0.5-5-1.4l-0.4-0.2-3.7 1 1-3.6-0.2-0.4c-1-1.6-1.5-3.4-1.5-5.3 0-5.4 4.4-9.8 9.8-9.8 2.6 0 5.1 1 6.9 2.9 1.9 1.9 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8zm5.5-7.3c-0.3-0.1-1.7-0.9-2-1-0.3-0.1-0.5-0.1-0.7 0.1-0.2 0.3-0.8 1-0.9 1.2-0.2 0.2-0.3 0.2-0.6 0.1-0.3-0.1-1.3-0.5-2.4-1.5-0.9-0.8-1.5-1.8-1.7-2.1-0.2-0.3 0-0.5 0.1-0.6s0.3-0.3 0.4-0.5c0.1-0.2 0.2-0.3 0.3-0.5 0.1-0.2 0-0.4 0-0.5-0.1-0.1-0.7-1.6-0.9-2.2-0.2-0.6-0.5-0.5-0.7-0.5-0.2 0-0.4 0-0.6 0-0.2 0-0.5 0.1-0.8 0.4-0.3 0.3-1 1-1 2.5s1.1 2.9 1.2 3.1c0.1 0.2 2.1 3.2 5.1 4.5 0.7 0.3 1.3 0.5 1.7 0.6 0.7 0.2 1.4 0.2 1.9 0.1 0.6-0.1 1.8-0.7 2-1.4 0.2-0.7 0.2-1.3 0.2-1.4-0.1-0.2-0.3-0.3-0.6-0.4z" />
            </svg>
            Contáctanos por WhatsApp
          </a>
        </div>
      </footer>
    </div>
  );
}
