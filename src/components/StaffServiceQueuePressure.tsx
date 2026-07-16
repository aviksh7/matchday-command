import React from 'react';
import StatusChip from './StatusChip';
import type { ConcessionData } from '../types';

interface StaffServiceQueuePressureProps {
  venueName: string;
  services: ConcessionData[];
}

type QueuePressure = 'Low' | 'Elevated' | 'High';

const getQueuePressure = (waitTimeMinutes: number): QueuePressure => {
  if (waitTimeMinutes >= 20) return 'High';
  if (waitTimeMinutes >= 10) return 'Elevated';
  return 'Low';
};

const getPressureStatus = (pressure: QueuePressure): 'Normal' | 'Elevated' | 'Critical' => {
  if (pressure === 'High') return 'Critical';
  if (pressure === 'Elevated') return 'Elevated';
  return 'Normal';
};

export const StaffServiceQueuePressure: React.FC<StaffServiceQueuePressureProps> = ({
  venueName,
  services,
}) => (
  <section className="card staff-command__card staff-service-queues" aria-labelledby="staff-service-queues-heading">
    <div className="staff-service-queues__heading">
      <h3 id="staff-service-queues-heading">Simulated Service Queue Pressure</h3>
      <span className="staff-service-queues__feed-label">Local simulated snapshot, not live</span>
    </div>
    <p className="staff-service-queues__description">
      Static prototype estimates from the selected venue snapshot. Not connected to concession, restroom, or wait-time sensors.
    </p>

    {services.length > 0 ? (
      <div
        className="staff-command__table-scroll staff-service-queues__table-scroll"
        role="region"
        aria-label="Scrollable simulated service queue table"
        tabIndex={0}
      >
        <table className="staff-service-queues__table">
          <caption>
            Simulated service waits for {venueName}, including concession, merchandise, and restroom locations. Pressure bands are derived locally from the displayed wait estimate.
          </caption>
          <thead>
            <tr>
              <th scope="col">Location</th>
              <th scope="col">Service</th>
              <th scope="col">Simulated wait</th>
              <th scope="col">Pressure</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => {
              const pressure = getQueuePressure(service.waitTimeMinutes);

              return (
                <tr key={service.id}>
                  <th scope="row">{service.name}</th>
                  <td>{service.type}</td>
                  <td>{service.waitTimeMinutes} min</td>
                  <td>
                    <StatusChip
                      status={getPressureStatus(pressure)}
                      theme="paper"
                      label={`${pressure} pressure`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="staff-command__supporting-copy">No simulated service wait estimates are available for this venue snapshot.</p>
    )}
  </section>
);

export default StaffServiceQueuePressure;
