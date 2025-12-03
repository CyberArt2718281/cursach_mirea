import { Component, OnInit } from '@angular/core';
import { ModalConfig } from '../components/modal/modal.component';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent implements OnInit {
  modalConfig: ModalConfig = { title: '', message: '', type: 'alert' };
  isModalOpen = false;

  constructor(private modalService: ModalService) {}

  ngOnInit() {
    this.modalService.modal$.subscribe(({ config, isOpen }) => {
      if (config) {
        this.modalConfig = config;
      }
      this.isModalOpen = isOpen;
    });
  }

  onModalConfirm() {
    this.modalService.handleConfirm();
  }

  onModalCancel() {
    this.modalService.handleCancel();
  }

  onModalClose() {
    this.modalService.close();
  }
}
