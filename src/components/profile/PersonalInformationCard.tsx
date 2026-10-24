import type { ProfileData } from "@/types/profile";

type PersonalInformationCardProps = {
  profile: ProfileData;
};

export default function PersonalInformationCard({ profile }: PersonalInformationCardProps) {
  return (
    <section className="bkpfl-card bkpfl-information" aria-labelledby="bkpfl-information-title">
      <div className="bkpfl-cardHeading">
        <p className="bkpfl-eyebrow">Detail akun</p>
        <h2 id="bkpfl-information-title">Informasi Pribadi</h2>
      </div>

      <dl className="bkpfl-details">
        <div className="bkpfl-detailRow">
          <dt>Nama Lengkap</dt>
          <dd>{profile.fullName}</dd>
        </div>
        <div className="bkpfl-detailRow">
          <dt>Email</dt>
          <dd>{profile.email}</dd>
        </div>
        <div className="bkpfl-detailRow">
          <dt>Password</dt>
          <dd>
            <span className="bkpfl-passwordMask" aria-hidden="true">
              {profile.passwordMask}
            </span>
            <span className="bkpfl-visuallyHidden">Password disamarkan</span>
          </dd>
        </div>
        <div className="bkpfl-detailRow">
          <dt>Tanggal Bergabung</dt>
          <dd><time dateTime={profile.joinedDateTime}>{profile.joinedLabel}</time></dd>
        </div>
      </dl>
    </section>
  );
}
