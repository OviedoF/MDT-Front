import UserPage from "@/app/home/components/UserPage"
import { FaTimesCircle, FaQuestionCircle } from "react-icons/fa"

export default function RequestDeniedPage() {
  return (
    <UserPage>
      <div className="p-4 flex flex-col pb-24">
        <div className="flex-1 px-4 py-8 max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <div className="inline-block text-red-500 mb-2">
              <FaTimesCircle className="w-16 h-16" />
            </div>
            <h1 className="text-red-500 text-2xl font-medium">Solicitud denegada</h1>
          </div>

          <div className="flex items-center gap-3 mb-6 px-10">
            <div className="w-10 h-10 bg-green rounded-full flex items-center justify-center text-white font-medium">
              BL
            </div>
            <div>
              <div className="text-gray-600 font-semibold">{89001003}</div>
              <div className="font-normal">Lcda. Beatriz Lara</div>
            </div>
          </div>

          {/* Denial Explanation */}
          <div className="space-y-4 mb-8">
            <p className="text-gray-600">
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.
              Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
            </p>

            <ul className="list-disc pl-5 text-gray-600">
              <li>
                Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.
              </li>
            </ul>
          </div>

          {/* Accept Button */}
          <button className="w-full bg-green hover:bg-[#5a7a62] font-bold text-white rounded-lg py-3 px-4 transition-colors mb-6">
            Aceptar
          </button>

          {/* Help Text */}
          <div className="flex items-start gap-2 text-sm text-gray-600 px-4">
            <FaQuestionCircle className="w-5 h-5 text-[#6A8D73] mt-0.5" />
            <div>
              <p className="font-medium">¿Dudas sobre la solicitud denegada?</p>
              <p>Comunícate con el área al 0000-0000.</p>
            </div>
          </div>
        </div>
      </div>
    </UserPage>
  )
}

