type PendingWaveDotsProps = {
  label: string;
};

export default function PendingWaveDots({ label }: PendingWaveDotsProps) {
  return (
    <span className="inline-flex items-end">
      <span>{label}</span>
      <span className="pending-wave-dots" aria-hidden="true">
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
    </span>
  );
}
