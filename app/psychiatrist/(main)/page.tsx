import KPICard from "@/components/partials/KPICard";
import TodaysSessions from "@/components/partials/TodaysSessions";
import UnfinishedFeedback from "@/components/partials/UnfinishedFeedback";
import starIcon from "@/public/icon/star-outline.svg";
import Image from "next/image";
import { getPsychiatristDashboardData } from "@/app/actions/psychiatrist";
import Link from "next/link";

export default async function page() {
  const res = await getPsychiatristDashboardData();
  const data = res?.data;
  console.log(data);

  return (
    <div className="p-6">
      <div className=" grid gap-3">
        <p className="text-label-small-medium text-text-subheading">
          Welcome to your daily board
        </p>

        <p className="text-heading-2-bold ">
          Good Morning,{" "}
          <span className="text-text-action">
            {data?.psychiatristName || "Nanda"}
          </span>{" "}
        </p>
        <div className="flex justify-between">
          <div className="rounded-full border border-border-default p-4 bg-surface-primary-light w-fit flex gap-3">
            <Image src={starIcon} alt="Plant-Icon" priority />
            <p className="text-body-base-medium text-text-body">
              You have {data?.kpis.todayCount || 0} appointments today!.
              {data?.kpis.nextSession
                ? ` Next session at ${data.kpis.nextSession}`
                : " No more sessions for today."}
            </p>
          </div>
          <div className="flex gap-3 items-end">
            <Link
              href="/psychiatrist/consultation/queue"
              className="button-primary-medium"
            >
              See Queue
            </Link>
            <Link
              href="/psychiatrist/profile/availability"
              className="button-secondary-medium"
            >
              Edit Availability
            </Link>
          </div>
        </div>
      </div>

      <div>
        <div className="flex w-full gap-3 mt-6 overflow-x-auto pb-2">
          <KPICard
            title="Today's Appointment"
            value={data?.kpis.todayCount?.toString() || "0"}
            unit="Patient"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-8"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M1 18q-.425 0-.712-.288T0 17v-.575q0-1.075 1.1-1.75T4 14q.325 0 .625.013t.575.062q-.35.525-.525 1.1t-.175 1.2V18zm6 0q-.425 0-.712-.288T6 17v-.625q0-.8.438-1.463t1.237-1.162T9.588 13T12 12.75q1.325 0 2.438.25t1.912.75t1.225 1.163t.425 1.462V17q0 .425-.287.713T17 18zm12.5 0v-1.625q0-.65-.162-1.225t-.488-1.075q.275-.05.563-.062T20 14q1.8 0 2.9.663t1.1 1.762V17q0 .425-.288.713T23 18zM8.125 16H15.9q-.25-.5-1.388-.875T12 14.75t-2.512.375T8.125 16M4 13q-.825 0-1.412-.587T2 11q0-.85.588-1.425T4 9q.85 0 1.425.575T6 11q0 .825-.575 1.413T4 13m16 0q-.825 0-1.412-.587T18 11q0-.85.588-1.425T20 9q.85 0 1.425.575T22 11q0 .825-.575 1.413T20 13m-8-1q-1.25 0-2.125-.875T9 9q0-1.275.875-2.137T12 6q1.275 0 2.138.863T15 9q0 1.25-.862 2.125T12 12m0-2q.425 0 .713-.288T13 9t-.288-.712T12 8t-.712.288T11 9t.288.713T12 10m0-1"
                />
              </svg>
            }
          />
          <KPICard
            title="Next Session"
            value={data?.kpis.nextSession || "None"}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-8"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="m13 12.175l2.25 2.25q.275.275.275.688t-.275.712q-.3.3-.712.3t-.713-.3L11.3 13.3q-.15-.15-.225-.337T11 12.575V9q0-.425.288-.712T12 8t.713.288T13 9zm-1.713-6.462Q11 5.425 11 5V4h2v1q0 .425-.288.713T12 6t-.712-.288m7 5.576Q18.575 11 19 11h1v2h-1q-.425 0-.712-.288T18 12t.288-.712m-5.575 7Q13 18.575 13 19v1h-2v-1q0-.425.288-.712T12 18t.713.288m-7-5.575Q5.425 13 5 13H4v-2h1q.425 0 .713.288T6 12t-.288.713M12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m8-10q0-3.35-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20t5.675-2.325T20 12m-8 0"
                />
              </svg>
            }
          />
          <KPICard
            title="Patient Feedback Draft"
            value={data?.kpis.draftCount?.toString() || "0"}
            unit="Draft"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-8"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M1 18q-.425 0-.712-.288T0 17v-.575q0-1.075 1.1-1.75T4 14q.325 0 .625.013t.575.062q-.35.525-.525 1.1t-.175 1.2V18zm6 0q-.425 0-.712-.288T6 17v-.625q0-.8.438-1.463t1.237-1.162T9.588 13T12 12.75q1.325 0 2.438.25t1.912.75t1.225 1.163t.425 1.462V17q0 .425-.287.713T17 18zm12.5 0v-1.625q0-.65-.162-1.225t-.488-1.075q.275-.05.563-.062T20 14q1.8 0 2.9.663t1.1 1.762V17q0 .425-.288.713T23 18zM8.125 16H15.9q-.25-.5-1.388-.875T12 14.75t-2.512.375T8.125 16M4 13q-.825 0-1.412-.587T2 11q0-.85.588-1.425T4 9q.85 0 1.425.575T6 11q0 .825-.575 1.413T4 13m16 0q-.825 0-1.412-.587T18 11q0-.85.588-1.425T20 9q.85 0 1.425.575T22 11q0 .825-.575 1.413T20 13m-8-1q-1.25 0-2.125-.875T9 9q0-1.275.875-2.137T12 6q1.275 0 2.138.863T15 9q0 1.25-.862 2.125T12 12m0-2q.425 0 .713-.288T13 9t-.288-.712T12 8t-.712.288T11 9t.288.713T12 10m0-1"
                />
              </svg>
            }
          />
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TodaysSessions items={data?.sessions} />
          <UnfinishedFeedback items={data?.feedback} limit={2} />
        </div>
      </div>
    </div>
  );
}
