import Image from "next/image";
import WorkspaceIcon from "@/components/workspace/WorkspaceIcon";
import { dashboardRecommendations } from "@/data/dashboard";

export default function Recommendations() {
  return (
    <section className="bkd-panel bkd-recommendations" aria-labelledby="judul-rekomendasi">
      <div className="bkd-panelHeading"><h2 id="judul-rekomendasi"><WorkspaceIcon name="target" size={20} /> Rekomendasi Selanjutnya</h2></div>
      <ol className="bkd-recommendationList">
        {dashboardRecommendations.map((item, index) => (
          <li key={item.title}>
            <span className="bkd-recommendationNumber" aria-hidden="true">{index + 1}</span>
            <div className="bkd-recommendationCard">
              <Image src={item.icon} alt="" width={30} height={30} />
              <div><h3>{item.title}</h3><p>{item.description}</p></div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
