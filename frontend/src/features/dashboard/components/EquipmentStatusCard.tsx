import { Link } from 'react-router-dom';

export const EquipmentStatusCard = () => {
  return (
    <div className="card bg-base-200/50 border border-base-300 shadow-xs">
      <div className="card-body p-5 sm:p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title text-lg font-bold">Inventory Status</h2>
            <span className="badge badge-outline badge-primary text-xs">Live Stock</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span>Wilson Pro Tennis Rackets</span>
                <span>18 / 25 Available</span>
              </div>
              <progress className="progress progress-primary w-full" value="18" max="25" />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span>Yonex Badminton Rackets</span>
                <span>14 / 20 Available</span>
              </div>
              <progress className="progress progress-secondary w-full" value="14" max="20" />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span>Basketballs & Volleyballs</span>
                <span>22 / 30 Available</span>
              </div>
              <progress className="progress progress-accent w-full" value="22" max="30" />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span>Squash Rackets & Eye Guards</span>
                <span>8 / 10 Available</span>
              </div>
              <progress className="progress progress-success w-full" value="8" max="10" />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-base-300">
          <Link to="/equipment" className="btn btn-outline btn-block btn-sm">
            Manage All Equipment
          </Link>
        </div>
      </div>
    </div>
  );
};
