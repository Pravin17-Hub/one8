import { useNavigate } from 'react-router-dom';

export default function ProductCard({ id, title, price, imageIcon, imageUrl, matchScore = 95 }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (id) {
      navigate(`/product/${id}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="glass-card rounded-xl p-4 flex flex-col gap-3 group hover:-translate-y-1 transition-transform cursor-pointer"
    >
      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-surface-container flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-contain mix-blend-multiply" />
        ) : (
          <div className="w-full h-full bg-surface-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">{imageIcon || 'image'}</span>
          </div>
        )}
        <div className="absolute top-2 left-2 bg-secondary-container/80 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 border border-secondary/20">
          <span className="material-symbols-outlined text-[12px] text-on-secondary-container">psychology</span>
          <span className="text-label-sm font-label-sm text-on-secondary-container text-[10px]">{matchScore}% Match</span>
        </div>
      </div>
      <div>
        <h4 className="text-body-lg font-body-lg text-on-surface font-semibold line-clamp-1">{title}</h4>
        <p className="text-label-sm font-label-sm text-on-surface-variant mt-1">₹{price}</p>
      </div>
    </div>
  );
}
