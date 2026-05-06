import { PaymentExperience } from "@/components/PaymentExperience";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-2 border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
            Payment Gateway Simulation
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Enter card details, review the live preview, and submit a simulated
            payment through the mock gateway.
          </p>
        </header>

        <PaymentExperience />
      </section>
    </main>
  );
}
