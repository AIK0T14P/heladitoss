import { PhoneIcon } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-white py-6">
      <div className="container mx-auto px-4 text-center">
        <a
          href="https://wa.me/+541130171218"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition duration-300"
        >
          <PhoneIcon className="w-6 h-6 mr-2" />
          Contáctanos por WhatsApp
        </a>
      </div>
    </footer>
  )
}

