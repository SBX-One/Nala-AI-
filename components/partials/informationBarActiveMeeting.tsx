"use client";

import nalaLogo from "@/public/icon/Nala-Logo.svg";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function InformationBar() {
    const path = usePathname();
    const newPath = path.replace("/psychiatrist/", "");

    return (
            <div className="flex px-4 py-3 border-b w-full border-b-border-default items-center justify-between bg-surface-background">
                <div className="flex gap-4 items-center justify-start w-full">
                    <Image
                    src={nalaLogo}
                    alt="Nala-Logo"
                    priority
                    className="w-12.5 h-10"
                />
                    <p className="text-body-xl-bold text-text-heading ">
                        {newPath} {newPath === "" && "Dashboard"}
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full justify-end">
                

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-6 text-icon-default"
                        viewBox="0 0 24 24"
                    >
                        <path
                            fill="currentColor"
                            d="M12.838 17.638q.362-.363.362-.888t-.362-.888t-.888-.362t-.887.363t-.363.887t.363.888t.887.362t.888-.363M12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m.1-12.3q.625 0 1.088.4t.462 1q0 .55-.337.975t-.763.8q-.575.5-1.012 1.1t-.438 1.35q0 .35.263.588t.612.237q.375 0 .638-.25t.337-.625q.1-.525.45-.937t.75-.788q.575-.55.988-1.2t.412-1.45q0-1.275-1.037-2.087T12.1 6q-.95 0-1.812.4T8.975 7.625q-.175.3-.112.638t.337.512q.35.2.725.125t.625-.425q.275-.375.688-.575t.862-.2"
                        />
                    </svg>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-6 text-icon-default"
                        viewBox="0 0 24 24"
                    >
                        <path
                            fill="currentColor"
                            d="M5 19q-.425 0-.712-.288T4 18t.288-.712T5 17h1v-7q0-2.075 1.25-3.687T10.5 4.2v-.7q0-.625.438-1.062T12 2t1.063.438T13.5 3.5v.7q2 .5 3.25 2.113T18 10v7h1q.425 0 .713.288T20 18t-.288.713T19 19zm7 3q-.825 0-1.412-.587T10 20h4q0 .825-.587 1.413T12 22m-4-5h8v-7q0-1.65-1.175-2.825T12 6T9.175 7.175T8 10z"
                        />
                    </svg>

                    <div className="p-2 border border-border-default flex items-center rounded-2xl gap-3">
                        <div className="rounded-full size-8 bg-surface-disabled "></div>
                        <div>
                            <p className="text-label-small-semibold text-text-heading">
                                Andra Divano
                            </p>
                            <p className="text-label-caption-medium text-text-subheading">
                                andradiva@gmail.com
                            </p>
                        </div>
                    </div>
                </div>
            </div>
    );
}
